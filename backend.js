// server.js

const express = require('express');
const mongoose = require('mongoose');
const fileUpload = require('express-fileupload');
const xlsx = require('xlsx');
const cors = require('cors'); // Importe o pacote cors
const bodyParser = require('body-parser');
const path = require('path'); // Adiciona o módulo path
const fs = require('fs'); // Adiciona o módulo fs

const app = express();
const PORT = process.env.PORT || 3000;
app.use(bodyParser.json());
app.use(cors());

// Configurar pasta de imagens pública
const imagesDir = path.join(__dirname, 'public', 'images');
app.use('/images', express.static(imagesDir));

const { Cliente, Livro, Venda, Caixa } = require('./models');

const DB_PASSWORD = 'v1d4l0k4'; // Substitua pela senha real do banco de dados
const DB_NAME = 'lulifeira'; // Nome do seu banco de dados local
const DB_URI = `mongodb://localhost:27017/${DB_NAME}`;

mongoose.connect(DB_URI)
  .then(() => {
    console.log('Conectado ao MongoDB local');
    
    // Definir um schema simples (opcional)
    const testSchema = new mongoose.Schema({
      name: String,
      age: Number
    });

    // Criar o modelo associado à coleção "testCollection"
    const TestModel = mongoose.model('testCollection', testSchema);

    // Inserir um documento para criar a coleção automaticamente
    TestModel.create({ name: 'Teste', age: 42 })
      .then((doc) => {
        console.log('Documento inserido:', doc);

      })
      .catch((err) => {
        console.error('Erro ao inserir documento:', err);

      });
  })
  .catch((error) => {
    console.error('Erro ao conectar ao MongoDB local:', error);
  });

// Middleware para lidar com o upload de arquivos
app.use(fileUpload());

// Função para agrupar itens duplicados com mesmo ISBN e mesmo valor de venda
function agruparLivrosVendidos(livrosVendidos) {
  const livrosVendidosAgrupados = [];
  const map = new Map();

  livrosVendidos.forEach(livro => {
    const { ISBN, 'Valor Vendido': ValorVendido, ...resto } = livro;
    const chave = `${ISBN}-${ValorVendido}`;
    if (map.has(chave)) {
      const itemExistente = map.get(chave);
      itemExistente.Quantidade += livro.Quantidade;
    } else {
      map.set(chave, { ISBN, 'Valor Vendido': ValorVendido, ...resto });
    }
  });

  for (const item of map.values()) {
    livrosVendidosAgrupados.push(item);
  }

  return livrosVendidosAgrupados;
}

app.post('/adicionar-estoque', async (req, res) => {
  console.log('Iniciando adição de estoque...');
  
  if (!req.files || !req.files.estoque) {
    console.log('Erro: Nenhum arquivo enviado');
    return res.status(400).json({ error: 'Nenhum arquivo enviado' });
  }

  const estoqueFile = req.files.estoque;
  console.log('Arquivo recebido:', {
    name: estoqueFile.name,
    mimetype: estoqueFile.mimetype,
    size: estoqueFile.size
  });

  // Verifica se o arquivo é do tipo Excel
  const excelMimeTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel' // .xls
  ];
  
  if (!excelMimeTypes.includes(estoqueFile.mimetype)) {
    console.log('Erro: Arquivo não é Excel. Mimetype:', estoqueFile.mimetype);
    return res.status(400).json({ error: 'O arquivo enviado não é um arquivo Excel' });
  }

  try {
    // Lê o arquivo Excel
    console.log('Lendo arquivo Excel...');
    const workbook = xlsx.read(estoqueFile.data, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);
    console.log('Dados lidos do Excel:', data);

    for (const item of data) {
      console.log('Processando item:', item);
      
      // Mapeia os campos do novo cabeçalho na sequência correta
      const livroData = {
        ISBN: item.ISBN,
        Editora: item.EDITORA,
        Título: item.TÍTULO,
        Autor: item.AUTOR,
        Valor: item.VALOR,
        Estoque: item.ESTOQUE,
        Categoria: item.CATEGORIA,
        'Valor Feira': item['VALOR FEIRA'],
        'Estoque Saldo': item['ESTOQUE SALDO'],
        'Preço Saldo': item['PREÇO SALDO']
      };
      console.log('Dados mapeados:', livroData);

      // Verifica se o ISBN já está cadastrado no banco de dados
      const existingLivro = await Livro.findOne({ ISBN: livroData.ISBN });
      console.log('Livro existente:', existingLivro);

      if (existingLivro) {
        console.log('Atualizando livro existente...');
        // Se o ISBN já existir, adicione o estoque e o estoque saldo ao existente
        existingLivro.Estoque += livroData.Estoque;
        existingLivro['Estoque Saldo'] += livroData['Estoque Saldo'];
        await existingLivro.save();
        console.log('Livro atualizado:', existingLivro);
      } else {
        console.log('Criando novo livro...');
        // Se o ISBN não existir, crie um novo documento no banco de dados
        const novoLivro = await Livro.create(livroData);
        console.log('Novo livro criado:', novoLivro);
      }
    }

    console.log('Processo finalizado com sucesso');
    res.status(200).json({ message: 'Dados do estoque cadastrados com sucesso' });
  } catch (error) {
    console.error('Erro detalhado ao cadastrar dados do estoque:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ error: 'Erro ao cadastrar dados do estoque' });
  }
});

app.post('/substituir-estoque', (req, res) => {
  console.log('Iniciando substituição de estoque...');
  
  if (!req.files || !req.files.estoque) {
    console.log('Erro: Nenhum arquivo enviado');
    return res.status(400).json({ error: 'Nenhum arquivo enviado' });
  }

  const estoqueFile = req.files.estoque;
  console.log('Arquivo recebido:', {
    name: estoqueFile.name,
    mimetype: estoqueFile.mimetype,
    size: estoqueFile.size
  });

  // Verifica se o arquivo é do tipo Excel
  const excelMimeTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel' // .xls
  ];
  
  if (!excelMimeTypes.includes(estoqueFile.mimetype)) {
    console.log('Erro: Arquivo não é Excel. Mimetype:', estoqueFile.mimetype);
    return res.status(400).json({ error: 'O arquivo enviado não é um arquivo Excel' });
  }

  try {
    // Lê o arquivo Excel
    console.log('Lendo arquivo Excel...');
    const workbook = xlsx.read(estoqueFile.data, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);
    console.log('Dados lidos do Excel:', data);

    // Mapeia os dados para o novo formato na sequência correta
    const mappedData = data.map(item => ({
      ISBN: item.ISBN,
      Editora: item.EDITORA,
      Título: item.TÍTULO,
      Autor: item.AUTOR,
      Valor: item.VALOR,
      Estoque: item.ESTOQUE,
      Categoria: item.CATEGORIA,
      'Valor Feira': item['VALOR FEIRA'],
      'Estoque Saldo': item['ESTOQUE SALDO'],
      'Preço Saldo': item['PREÇO SALDO']
    }));
    console.log('Dados mapeados:', mappedData);

    // Substitui o conteúdo do estoque pelo novo conteúdo
    console.log('Excluindo estoque existente...');
    Livro.deleteMany({})
      .then(() => {
        console.log('Inserindo novo estoque...');
        Livro.insertMany(mappedData)
          .then(() => {
            console.log('Estoque substituído com sucesso');
            res.status(200).json({ message: 'Estoque substituído com sucesso' });
          })
          .catch((error) => {
            console.error('Erro ao cadastrar novo estoque:', error);
            res.status(500).json({ error: 'Erro ao cadastrar novo estoque' });
          });
      })
      .catch((error) => {
        console.error('Erro ao excluir estoque existente:', error);
        res.status(500).json({ error: 'Erro ao excluir estoque existente' });
      });
  } catch (error) {
    console.error('Erro detalhado ao substituir estoque:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ error: 'Erro ao substituir estoque' });
  }
});

// Rota para baixar o modelo de Excel
app.get('/modelo-estoque', (req, res) => {
  try {
    // Cria um workbook novo
    const workbook = xlsx.utils.book_new();
    
    // Dados de exemplo com a sequência correta
    const dados = [{
      ISBN: '9788535909555',
      EDITORA: 'Editora Exemplo',
      TÍTULO: 'Livro de Exemplo',
      AUTOR: 'Autor Exemplo',
      VALOR: 50.00,
      ESTOQUE: 10,
      CATEGORIA: 'Ficção',
      'VALOR FEIRA': 35.00,
      'ESTOQUE SALDO': 5,
      'PREÇO SALDO': 25.00
    }];

    // Cria uma worksheet com os dados
    const worksheet = xlsx.utils.json_to_sheet(dados);

    // Adiciona a worksheet ao workbook
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Estoque');

    // Gera o buffer do arquivo
    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Configura os headers para download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=modelo-estoque.xlsx');

    // Envia o arquivo
    res.send(buffer);
  } catch (error) {
    console.error('Erro ao gerar modelo de estoque:', error);
    res.status(500).json({ error: 'Erro ao gerar modelo de estoque' });
  }
});

// Rota para obter dados do livro por ISBN
app.get('/livro/:isbn', (req, res) => {
  const isbn = req.params.isbn;

  // Consulta o MongoDB para encontrar o livro com o ISBN fornecido
  Livro.findOne({ ISBN: isbn })
    .then((livro) => {
      if (!livro) {
        return res.status(404).json({ error: 'Livro não encontrado' });
      }

      // Retorna os dados do livro encontrado
      res.status(200).json({ livro });
    })
    .catch((error) => {
      console.error('Erro ao buscar dados do livro:', error);
      res.status(500).json({ error: 'Erro ao buscar dados do livro' });
    });
});

app.post('/salvarcliente', async (req, res) => {
    try {
      // Extrair os dados do corpo da solicitação
      const { nome, cpf, email, telefone, cep, endereco, bairro, cidade, estado } = req.body;
  
      // Verificar se já existe um cliente com o CPF OU email fornecido
      const clienteExistente = await Cliente.findOne({
        $or: [
          { cpf },
          { email }
        ]
      });
  
      // Se o cliente já existir, retornar o objeto cliente
      if (clienteExistente) {
        return res.status(200).json({ cliente: clienteExistente });
      }
  
      // Criar uma nova instância do modelo Cliente
      const novoCliente = new Cliente({
        nome,
        cpf,
        email,
        telefone,
        cep,
        endereco,
        bairro,
        cidade,
        estado,
      });
  
      // Salvar o cliente no banco de dados
      const clienteSalvo = await novoCliente.save();
  
      // Retornar o objeto cliente recém-salvo
      res.status(201).json({ cliente: clienteSalvo });
    } catch (error) {
      console.error('Erro ao salvar o cliente:', error);
      res.status(500).json({ mensagem: 'Erro ao salvar o cliente' });
    }
});

app.post('/registrar-venda', async (req, res) => {
  try {
      // Extrair todas as informações da solicitação
      const { cliente, livros, total, formaPagamento, saldo } = req.body;

      // Criar uma nova instância do modelo Venda com o campo saldo
      const novaVenda = new Venda({
          cliente,
          livros,
          total,
          formaPagamento,
          saldo // Armazena o valor de saldo no banco de dados
      });

      // Salvar a venda no banco de dados
      const vendaRegistrada = await novaVenda.save();

      // Atualizar o estoque dos livros vendidos na coleção de Livros
      await Promise.all(livros.map(async (livro) => {
          const estoqueCampo = saldo ? 'Estoque Saldo' : 'Estoque';
          await Livro.findByIdAndUpdate(livro.livro, { $inc: { [estoqueCampo]: -livro.quantidade } });
      }));

      // Responder com sucesso
      res.status(200).json({ mensagem: 'Venda registrada com sucesso!', venda: vendaRegistrada });
  } catch (error) {
      console.error('Erro ao registrar a venda:', error);
      res.status(500).json({ mensagem: 'Erro ao registrar a venda' });
  }
});

app.post('/estornar-venda/:id', async (req, res) => {
  try {
    // Extrair o ID da venda a ser estornada dos parâmetros da solicitação
    const vendaId = req.params.id;

    // Buscar a venda pelo ID
    const vendaParaEstornar = await Venda.findById(vendaId);

    // Se a venda não existir, retornar um erro 404
    if (!vendaParaEstornar) {
      return res.status(404).json({ mensagem: 'Venda não encontrada' });
    }

    // Determinar qual campo de estoque ajustar com base no valor de saldo
    const estoqueCampo = vendaParaEstornar.saldo ? 'Estoque Saldo' : 'Estoque';

    // Restaurar o estoque dos livros vendidos na coleção de Livros
    await Promise.all(vendaParaEstornar.livros.map(async (livro) => {
      await Livro.findByIdAndUpdate(livro.livro, { $inc: { [estoqueCampo]: livro.quantidade } });
    }));

    // Remover a venda do banco de dados
    await Venda.findByIdAndDelete(vendaId);

    // Responder com sucesso
    res.status(200).json({ mensagem: 'Venda estornada com sucesso!' });
  } catch (error) {
    console.error('Erro ao estornar a venda:', error);
    res.status(500).json({ mensagem: 'Erro ao estornar a venda' });
  }
});

app.get('/vendas', async (req, res) => {
    try {
      const vendas = await Venda.find();
      res.status(200).json(vendas);
    } catch (error) {
      console.error('Erro ao listar vendas:', error);
      res.status(500).json({ mensagem: 'Erro ao listar vendas' });
    }
  }); 

  app.get('/vendas/:id', async (req, res) => {
    try {
        const venda = await Venda.findById(req.params.id)
            .populate('cliente')
            .populate({
                path: 'livros',
                populate: { path: 'livro' }
            });

        if (!venda) {
            return res.status(404).json({ mensagem: 'Venda não encontrada' });
        }

        // Substituir as referências pelo conteúdo real
        const vendaFormatada = {
            ...venda._doc,
            cliente: venda.cliente,
            livros: venda.livros.map(livro => ({
                ...livro._doc,
                livro: livro.livro
            }))
        };

        res.json(vendaFormatada);
    } catch (error) {
        console.error('Erro ao buscar a venda:', error);
        res.status(500).json({ mensagem: 'Erro ao buscar a venda' });
    }
});

app.put('/vendas/:idCliente/:idVenda', async (req, res) => {
  try {
    // Extrair o ID do cliente e da venda da solicitação
    const { idCliente, idVenda } = req.params;

    // Verificar se a venda existe
    const vendaExistente = await Venda.findById(idVenda);
    if (!vendaExistente) {
      return res.status(404).json({ mensagem: 'Venda não encontrada' });
    }

    // Atualizar o cliente da venda
    vendaExistente.cliente = idCliente;

    // Salvar a venda atualizada no banco de dados
    const vendaAtualizada = await vendaExistente.save();

    // Responder com sucesso e enviar a venda atualizada
    res.status(200).json({ mensagem: 'Cliente relacionado à venda com sucesso', venda: vendaAtualizada });
  } catch (error) {
    console.error('Erro ao relacionar o cliente à venda:', error);
    res.status(500).json({ mensagem: 'Erro ao relacionar o cliente à venda' });
  }
});

app.put('/editarcliente/:id', async (req, res) => {
  try {
    // Extrair o ID do cliente a ser editado dos parâmetros da solicitação
    const clienteId = req.params.id;

    // Extrair os dados atualizados do corpo da solicitação
    const { nome, cpf, email, telefone, cep, endereco, bairro, cidade, estado } = req.body;

    // Procurar o cliente pelo ID
    const clienteExistente = await Cliente.findById(clienteId);

    // Se o cliente não existir, retornar um erro 404
    if (!clienteExistente) {
      return res.status(404).json({ mensagem: 'Cliente não encontrado' });
    }

    // Atualizar os campos do cliente existente
    clienteExistente.nome = nome;
    clienteExistente.cpf = cpf;
    clienteExistente.email = email;
    clienteExistente.telefone = telefone;
    clienteExistente.cep = cep;
    clienteExistente.endereco = endereco;
    clienteExistente.bairro = bairro;
    clienteExistente.cidade = cidade;
    clienteExistente.estado = estado;

    // Salvar as alterações no banco de dados
    const clienteAtualizado = await clienteExistente.save();

    // Retornar o cliente atualizado
    res.status(200).json({ cliente: clienteAtualizado });
  } catch (error) {
    console.error('Erro ao editar o cliente:', error);
    res.status(500).json({ mensagem: 'Erro ao editar o cliente' });
  }
});

app.get('/clientes', async (req, res) => {
  try {
    const clientes = await Cliente.find();
    res.status(200).json(clientes);
  } catch (error) {
    console.error('Erro ao listar clientes:', error);
    res.status(500).json({ mensagem: 'Erro ao listar clientes' });
  }
});

app.get('/cliente/:cpf', async (req, res) => {
  try {
    const { cpf } = req.params;
    const cliente = await Cliente.findOne({ cpf });
    
    if (!cliente) {
      return res.status(404).json({ mensagem: 'Cliente não encontrado' });
    }
    
    res.status(200).json(cliente);
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    res.status(500).json({ mensagem: 'Erro ao buscar cliente' });
  }
});

app.get('/livros', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 100;
  const query = req.query.q;
  const categoria = req.query.categoria;

  try {
    let filter = {};

    // Construir o filtro combinando busca e categoria
    if (query || categoria) {
      filter.$and = [];
      
      if (query) {
        filter.$and.push({
          $or: [
            { 'Título': { $regex: query, $options: 'i' } },
            { 'Autor': { $regex: query, $options: 'i' } },
            { 'Editora': { $regex: query, $options: 'i' } },
            { 'ISBN': { $regex: query, $options: 'i' } }
          ]
        });
      }
      
      if (categoria) {
        filter.$and.push({ 'Categoria': categoria });
      }
    }

    const count = await Livro.countDocuments(filter);
    const totalPages = Math.ceil(count / limit);
    const skip = (page - 1) * limit;

    const livros = await Livro.find(filter).skip(skip).limit(limit);

    res.json({ livros, totalPages });
  } catch (error) {
    console.error('Erro ao buscar os livros:', error);
    res.status(500).json({ message: 'Erro ao buscar os livros' });
  }
});

app.put('/livros/:id', async (req, res) => {
  const { id } = req.params;
  const { ValorFeira, Estoque, EstoqueSaldo, PrecoSaldo } = req.body;

  console.log('Atualizando livro:', { ValorFeira, Estoque, EstoqueSaldo, PrecoSaldo }); // Adicione esta linha

  try {
    const livro = await Livro.findByIdAndUpdate(
      id,
      { 
        $set: { 
          'Valor Feira': ValorFeira, 
          Estoque: Estoque,
          'Estoque Saldo': EstoqueSaldo,
          'Preço Saldo': PrecoSaldo
        } 
      },
      { new: true }
    );

    if (!livro) {
      return res.status(404).json({ message: 'Livro não encontrado' });
    }

    res.json(livro);
  } catch (error) {
    console.error('Erro ao atualizar livro:', error);
    res.status(500).json({ message: 'Erro ao atualizar livro' });
  }
});

app.get('/livros/:id', async (req, res) => {
  try {
    const livroId = req.params.id;
    const livro = await Livro.findById(livroId); // Usando Mongoose para buscar pelo ID

    if (!livro) {
      return res.status(404).json({ message: 'Livro não encontrado' });
    }

    res.json(livro);
  } catch (error) {
    console.error('Erro ao buscar livro:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Rota para obter estatísticas das vendas dentro de um período de datas
app.post('/relatorio-vendas', async (req, res) => {
  try {
    // Extrair as datas de início e fim do corpo da solicitação
    const { dataInicio, dataFim } = req.body;

    console.log(dataInicio)
    console.log(dataFim)
    
    // Converter as datas para objetos Date
    const dataInicioDate = new Date(dataInicio);
    const dataFimDate = new Date(dataFim);

    // Consultar o banco de dados para obter as estatísticas das vendas dentro do período fornecido
    const relatorioVendas = await Venda.aggregate([
      {
        $match: {
          timestamp: {
            $gte: dataInicioDate,
            $lte: dataFimDate
          }
        }
      },
      {
        $group: {
          _id: "$formaPagamento",
          totalVendas: { $sum: 1 },
          totalProdutosVendidos: { $sum: { $sum: "$livros.quantidade" } },
          valorTotalVendas: { $sum: "$total" }
        }
      }
    ]);

    // Verificar se há dados disponíveis
    if (relatorioVendas.length === 0) {
      return res.status(404).json({ error: 'Nenhuma venda encontrada dentro do período especificado' });
    }

    // Retornar as estatísticas das vendas por forma de pagamento
    res.json(relatorioVendas); // O resultado do aggregate é um array de objetos agrupados por forma de pagamento
  } catch (error) {
    console.error('Erro ao gerar o relatório de vendas:', error);
    res.status(500).json({ error: 'Erro ao gerar o relatório de vendas' });
  }
});

app.post('/relatorio-livros-vendidos', async (req, res) => {
  try {
    const { dataInicio, dataFim } = req.body;

    // Converter as datas para objetos Date ajustados para o fuso horário UTC
    const dataInicioTimestamp = new Date(dataInicio);
    const dataFimTimestamp = new Date(dataFim);

    // Consultar o banco de dados para obter todos os livros vendidos no período fornecido
    const vendas = await Venda.find({
      timestamp: {
        $gte: dataInicioTimestamp,
        $lte: dataFimTimestamp
      }
    }).populate('livros.livro');

    const livrosVendidos = [];

    // Iterar sobre as vendas e extrair os dados dos livros vendidos
    vendas.forEach(venda => {
      venda.livros.forEach(item => {
        const livroVendido = {
          ISBN: item.livro.ISBN,
          Título: item.livro['Título'],
          Editora: item.livro.Editora,
          'Valor Vendido': item.subtotal,
          Quantidade: item.quantidade
        };
        livrosVendidos.push(livroVendido);
      });
    });

    res.json(livrosVendidos);
  } catch (error) {
    console.error('Erro ao gerar o relatório de livros vendidos:', error);
    res.status(500).json({ error: 'Erro ao gerar o relatório de livros vendidos' });
  }
});

app.post('/relatorio-livros-vendidos-xlsx', async (req, res) => {
  try {
    const { dataInicio, dataFim } = req.body;

    // Consultar o banco de dados para obter todos os livros vendidos no período fornecido
    const vendas = await Venda.find({
      timestamp: {
        $gte: dataInicio,
        $lte: dataFim
      }
    }).populate('livros.livro');

    // Extrair os dados dos livros vendidos
    const livrosVendidos = [];
    vendas.forEach(venda => {
      venda.livros.forEach(item => {
        const livroVendido = {
          ISBN: item.livro.ISBN,
          Título: item.livro['Título'],
          Editora: item.livro.Editora,
          'Valor Vendido': item.subtotal,
          Quantidade: item.quantidade
        };
        livrosVendidos.push(livroVendido);
      });
    });

    // Verificar e agrupar itens duplicados com mesmo ISBN e mesmo valor de venda
    const livrosVendidosAgrupados = agruparLivrosVendidos(livrosVendidos);

    // Criar uma nova planilha
    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(livrosVendidosAgrupados);

    // Adicionar a planilha ao livro
    xlsx.utils.book_append_sheet(wb, ws, 'Livros Vendidos');

    // Salvar o livro em um arquivo
    const fileName = `relatorio_livros_vendidos_${Date.now()}.xlsx`;
    xlsx.writeFile(wb, fileName);

    // Enviar o arquivo xlsx como resposta
    res.download(fileName, fileName, (err) => {
      // Remover o arquivo temporário após o download ser concluído ou ocorrer um erro
      if (err) throw err;
    });
  } catch (error) {
    console.error('Erro ao gerar o relatório de livros vendidos em xlsx:', error);
    res.status(500).json({ error: 'Erro ao gerar o relatório de livros vendidos em xlsx' });
  }
});

app.post('/caixa/abrir', async (req, res) => {
  const { nomeAbertura, fundoCaixa } = req.body;

  // Verificar se os campos obrigatórios estão presentes
  if (!nomeAbertura || fundoCaixa === undefined) {
    return res.status(400).json({ message: 'Nome de abertura e fundo de caixa são obrigatórios.' });
  }

  try {
    // Verificar se já existe um caixa aberto hoje
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); // Zerar horas, minutos, segundos e milissegundos
    const caixaExistente = await Caixa.findOne({
      data: {
        $gte: hoje, // A data deve ser maior ou igual a hoje
        $lt: new Date(hoje.getTime() + 24 * 60 * 60 * 1000) // E menor que amanhã
      }
    });

    if (caixaExistente) {
      return res.status(400).json({
        message: 'Não é possível abrir o caixa. Já existe um caixa aberto para hoje.',
        caixaExistente // Opcional: Retorna o caixa existente para mais informações
      });
    }

    // Criar nova instância de Caixa
    const novaCaixa = new Caixa({
      data: new Date(), // Data e hora da requisição
      nomeAbertura,
      fundoCaixa, // Supondo que o valor de abertura seja igual ao fundo de caixa
    });

    // Salvar a nova caixa no banco de dados
    await novaCaixa.save();

    // Retornar resposta com a nova caixa criada
    res.status(201).json(novaCaixa);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao abrir caixa. Por favor, tente novamente mais tarde.' });
  }
});

app.post('/caixa/fechar', async (req, res) => {
  const { nomeFechamento, valorFechamento, credito, debito, pix, outros } = req.body;

  // Verificar se os campos obrigatórios estão presentes
  if (!nomeFechamento || valorFechamento === undefined) {
    return res.status(400).json({ mensagem: 'Nome de fechamento e valor de fechamento são obrigatórios.' });
  }

  try {
    // Obter a data e hora atual
    const dataFechamento = new Date();

    // Verificar se existe um caixa aberto hoje
    const caixaAberta = await Caixa.findOne({
      data: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      nomeFechamento: { $exists: false }
    });

    if (!caixaAberta) {
      return res.status(404).json({ mensagem: 'Nenhuma caixa aberta encontrada para fechamento.' });
    }

    // Calcular as vendas por forma de pagamento apenas do dia atual
    const vendas = await Venda.find({
      timestamp: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)), // Início do dia
        $lte: new Date(new Date().setHours(23, 59, 59, 999)) // Fim do dia
      }
    });

    // Calcular os totais por forma de pagamento
    const totalDinheiro = vendas
      .filter(venda => venda.formaPagamento === 'Dinheiro')
      .reduce((acc, venda) => acc + venda.total, 0);

    const totalCredito = vendas
      .filter(venda => venda.formaPagamento === 'Crédito')
      .reduce((acc, venda) => acc + venda.total, 0);

    const totalDebito = vendas
      .filter(venda => venda.formaPagamento === 'Débito')
      .reduce((acc, venda) => acc + venda.total, 0);

    const totalPix = vendas
      .filter(venda => venda.formaPagamento === 'Pix')
      .reduce((acc, venda) => acc + venda.total, 0);

    const totalOutros = vendas
      .filter(venda => venda.formaPagamento === 'Outros')
      .reduce((acc, venda) => acc + venda.total, 0);

    // Atualizar a caixa com o fechamento e calcular as diferenças
    const caixaFechada = await Caixa.findByIdAndUpdate(
      caixaAberta._id,
      {
        dataFechamento,
        nomeFechamento,
        valorFechamento,
        credito,
        debito,
        pix,
        outros,
        vendasDinheiro: totalDinheiro,
        vendasCredito: totalCredito,
        vendasDebito: totalDebito,
        vendasPix: totalPix,
        vendasOutros: totalOutros,
        diferencaDinheiro: totalDinheiro - valorFechamento + caixaAberta.fundoCaixa,
        diferencaCredito: totalCredito - credito,
        diferencaDebito: totalDebito - debito,
        diferencaPix: totalPix - pix,
        diferencaOutros: totalOutros - outros,
      },
      { new: true }
    );

    // Retornar resposta com a caixa fechada
    res.status(200).json({ mensagem: 'Caixa fechado com sucesso!', caixa: caixaFechada });
  } catch (error) {
    console.error('Erro ao fechar caixa:', error);
    res.status(500).json({ mensagem: 'Erro ao fechar caixa.' });
  }
});

app.post('/caixa/adicionar', async (req, res) => {
  const { valor, justificativa } = req.body;

  try {
    // Obter a data atual sem horário
    const dataHoje = new Date();
    dataHoje.setHours(0, 0, 0, 0);

    // Verificar se existe um caixa aberto para hoje
    const caixa = await Caixa.findOne({
      data: { $gte: dataHoje },
      dataFechamento: { $exists: false } // Verifica se o caixa não foi fechado
    });

    if (!caixa) {
      return res.status(400).json({ message: 'Nenhum caixa aberto para hoje.' });
    }

    // Atualizar fundoCaixa
    caixa.fundoCaixa += valor;
    caixa.movimentacao.push({ valor, justificativa }); // Adiciona a movimentação ao caixa
    await caixa.save(); // Salva as alterações no caixa

    res.status(200).json({ message: 'Dinheiro adicionado com sucesso!' });
  } catch (error) {
    console.error('Erro ao adicionar movimentação:', error);
    res.status(500).json({ message: 'Erro ao adicionar dinheiro.' });
  }
});

app.post('/caixa/remover', async (req, res) => {
  const { valor, justificativa } = req.body;

  try {
    // Obter a data atual sem horário
    const dataHoje = new Date();
    dataHoje.setHours(0, 0, 0, 0);

    // Verificar se existe um caixa aberto para hoje
    const caixa = await Caixa.findOne({
      data: { $gte: dataHoje },
      dataFechamento: { $exists: false } // Verifica se o caixa não foi fechado
    });

    if (!caixa) {
      return res.status(400).json({ message: 'Nenhum caixa aberto para hoje.' });
    }

    // Verificar se há fundo suficiente para remoção
    if (caixa.fundoCaixa < valor) {
      return res.status(400).json({ message: 'Fundo insuficiente para remoção.' });
    }

    // Atualizar fundoCaixa
    caixa.fundoCaixa -= valor;
    caixa.movimentacao.push({ valor: -valor, justificativa }); // Adiciona a movimentação como negativa
    await caixa.save(); // Salva as alterações no caixa

    res.status(200).json({ message: 'Dinheiro removido com sucesso!' });
  } catch (error) {
    console.error('Erro ao remover movimentação:', error);
    res.status(500).json({ message: 'Erro ao remover dinheiro.' });
  }
});

app.get('/caixa', async (req, res) => {
  const { data } = req.query;
  console.log(data);
  
  try {
    // Se a data for fornecida, converta-a para o formato correto de busca no MongoDB
    if (data) {
      const dataInicio = new Date(`${data}T00:00:00.000Z`); // Início do dia
      const dataFim = new Date(`${data}T23:59:59.999Z`); // Fim do dia
      
      const filtro = {
        data: { $gte: dataInicio, $lte: dataFim }
      };

      // Buscar caixas com o filtro aplicado
      const caixas = await Caixa.find(filtro);
      res.status(200).json(caixas);
    } else {
      res.status(400).json({ mensagem: 'A data é obrigatória.' });
    }
  } catch (error) {
    console.error('Erro ao buscar caixas:', error);
    res.status(500).json({ mensagem: 'Erro ao buscar caixas.' });
  }
});

// Rota para servir imagens
app.get('/imagem/:nome', (req, res) => {
  const nomeArquivo = req.params.nome;
  const caminhoImagem = path.join(imagesDir, nomeArquivo);
  
  // Verifica se o arquivo existe
  if (fs.existsSync(caminhoImagem)) {
    res.sendFile(caminhoImagem);
  } else {
    res.status(404).json({ error: 'Imagem não encontrada' });
  }
});

app.get('/categorias', async (req, res) => {
  try {
    const categorias = await Livro.distinct('Categoria');
    res.json(categorias.filter(Boolean)); // Remove categorias null/undefined
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar categorias' });
  }
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});