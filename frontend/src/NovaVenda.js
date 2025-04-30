import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './NovaVenda.css';
import apiUrl from './config'; // Importe a variável apiUrl
import { FaTrashAlt, FaMinusCircle, FaPlusCircle, FaUserPlus, FaShoppingCart, FaBook } from 'react-icons/fa';

function NovaVenda() {
  const [isbn, setIsbn] = useState('');
  const [livros, setLivros] = useState([]);
  const [erro, setErro] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [idCliente, setIdCliente] = useState(null);
  const [cliente, setCliente] = useState({
    nome: '',
    cpf: '',
    email: '',
    telefone: '',
    cep: '',
    endereco: '',
    bairro: '',
    cidade: '',
    estado: ''
  });
  const [formaPagamento, setFormaPagamento] = useState('Outros');
  const [isSaldo, setIsSaldo] = useState(false); // Estado para o switch
  const [imageLoadErrors, setImageLoadErrors] = useState({});
  const isbnInputRef = useRef(null);
  const [showClienteModal, setShowClienteModal] = useState(false);
  const [novoCliente, setNovoCliente] = useState({
    nome: '',
    cpf: '',
    email: '',
    telefone: '',
    cep: '',
    endereco: '',
    bairro: '',
    cidade: '',
    estado: ''
  });
  const [loadingCpf, setLoadingCpf] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [clienteEncontrado, setClienteEncontrado] = useState(false);

  useEffect(() => {
    // Foca o input de ISBN ao montar o componente
    if (isbnInputRef.current) {
      isbnInputRef.current.focus();
    }
  }, []);

  const handleImageError = (isbn) => {
    setImageLoadErrors(prev => ({ ...prev, [isbn]: true }));
  };

  const handleSwitchChange = () => {
    // Só permite alterar o switch se não houver livros na lista
    if (livros.length === 0) {
      setIsSaldo(!isSaldo); // Alterna entre "Novo" e "Saldo"
    } else {
      setErro('Não é possível mudar o tipo de estoque com livros adicionados.');
    }
  };

  const handleInputChange = (event) => {
    setIsbn(event.target.value);
  };

  const handleKeyPress = async (event) => {
    if (event.key === 'Enter') {
      try {
        const response = await fetch(`${apiUrl}/livro/${isbn}`);
        if (!response.ok) {
          throw new Error('Livro não encontrado');
        }
        const data = await response.json();
        const livroExistente = livros.find((livro) => livro.ISBN === data.livro.ISBN);

        const estoqueAtual = isSaldo ? data.livro['Estoque Saldo'] : data.livro.Estoque;
        if (livroExistente) {
          if (livroExistente.Quantidade < estoqueAtual) {
            setLivros(livros.map((livro) =>
              livro.ISBN === data.livro.ISBN
                ? { ...livro, Quantidade: livro.Quantidade + 1 }
                : livro
            ));
            setErro('');
          } else {
            setErro('A quantidade excede o estoque disponível');
          }
        } else {
          if (estoqueAtual >= 1) {
            setLivros([...livros, { ...data.livro, Quantidade: 1, Desconto: 0 }]);
            setErro('');
          } else {
            setErro('Estoque indisponível! Verifique o campo "Saldo/Novo".');
          }
        }
        setIsbn('');
      } catch (error) {
        setErro(error.message);
      }
    }
  };

  const handleAddCliente = () => {
    setShowModal(true);
  };

  const handleSalvarCliente = async (event) => {
    event.preventDefault(); // Evita o comportamento padrão do formulário
  
    try {
      const response = await axios.post(`${apiUrl}/salvarCliente`, cliente); // Substitua a URL aqui
      const clienteSalvo = response.data.cliente; // Captura o cliente retornado na resposta
      setIdCliente(clienteSalvo._id.toString()); // Atualiza o ID do cliente
      setCliente(clienteSalvo); // Atualiza todas as informações do cliente
      setShowModal(false); // Fechar o modal após salvar
    } catch (error) {
      console.error('Erro ao salvar o cliente:', error);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleInputChangeCliente = (event) => {
    const { name, value } = event.target;
    setNovoCliente({ ...novoCliente, [name]: value });
  };

  const handleAbrirClienteModal = () => {
    // Limpa o formulário ao abrir o modal
    setNovoCliente({
      nome: '',
      cpf: '',
      email: '',
      telefone: '',
      cep: '',
      endereco: '',
      bairro: '',
      cidade: '',
      estado: ''
    });
    setClienteEncontrado(false);
    setShowClienteModal(true);
  };

  const handleSalvarNovoCliente = async (event) => {
    event.preventDefault();
    try {
      // Tenta salvar/criar o cliente
      const response = await axios.post(`${apiUrl}/salvarcliente`, novoCliente);
      const clienteSalvo = response.data.cliente;
      
      // Atualiza o estado com o cliente vinculado
      setIdCliente(clienteSalvo._id.toString());
      setCliente(clienteSalvo);
      setShowClienteModal(false);
      setNovoCliente({
        nome: '',
        cpf: '',
        email: '',
        telefone: '',
        cep: '',
        endereco: '',
        bairro: '',
        cidade: '',
        estado: ''
      });
    } catch (error) {
      setErro('Erro ao salvar o cliente.');
    }
  };

  const handleFecharClienteModal = () => {
    setShowClienteModal(false);
    setNovoCliente({
      nome: '',
      cpf: '',
      email: '',
      telefone: '',
      cep: '',
      endereco: '',
      bairro: '',
      cidade: '',
      estado: ''
    });
  };

  const handleEditQuantidade = (livro, newQuantidade) => {
    const updatedLivros = livros.map((livroItem) =>
      livroItem.ISBN === livro.ISBN ? { ...livroItem, Quantidade: newQuantidade } : livroItem
    );
    setLivros(updatedLivros);
  };

  const handleRemoveLivro = (isbn) => {
    const updatedLivros = livros.filter((livro) => livro.ISBN !== isbn);
    setLivros(updatedLivros);
  };

  const handleDescontoChange = (livro, event) => {
    const value = event.target.value;
    const updatedLivros = livros.map((livroItem) =>
      livroItem.ISBN === livro.ISBN ? { ...livroItem, Desconto: value } : livroItem
    );
    setLivros(updatedLivros);
  };

  const calcularPrecoComDesconto = (valorFeira, desconto) => {
    const descontoDecimal = desconto / 100;
    const valorComDesconto = valorFeira - valorFeira * descontoDecimal;
    return valorComDesconto;
  };

  const calcularSubtotal = (livro) => {
    const valor = isSaldo ? livro['Preço Saldo'] : livro['Valor Feira'];
    const precoComDesconto = calcularPrecoComDesconto(valor, livro.Desconto);
    return (precoComDesconto * livro.Quantidade).toFixed(2);
  };

  const totalQuantidade = livros.reduce((acc, livro) => acc + livro.Quantidade, 0);
  const totalPrecoDesconto = livros.reduce((acc, livro) => acc + Number(calcularSubtotal(livro)), 0);

  useEffect(() => {
    const handleKeyDown = (event) => {
      // Verifica se Ctrl+Enter foi pressionado
      if (event.ctrlKey && event.key === 'Enter') {
        handleRegistrarVenda();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [livros, formaPagamento]); // Dependências necessárias para o handleRegistrarVenda

  const handleRegistrarVenda = async () => {
    if (livros.length === 0) {
      setErro('Nenhum livro incluído na venda');
      return;
    }
    
    if (!formaPagamento) {
      setErro('Selecione uma forma de pagamento');
      return;
    }

    try {
      const response = await axios.post(`${apiUrl}/registrar-venda`, {
        cliente: idCliente,
        livros: livros.map(livro => ({
          livro: livro._id,
          isbn: livro.ISBN,
          quantidade: livro.Quantidade,
          desconto: livro.Desconto,
          subtotal: calcularPrecoComDesconto(isSaldo ? livro['Preço Saldo'] : livro['Valor Feira'], livro.Desconto),
          estoqueTipo: isSaldo ? 'Estoque Saldo' : 'Estoque'
        })),
        total: totalPrecoDesconto,
        formaPagamento: formaPagamento,
        saldo: isSaldo
      });
      
      setLivros([]);
      setErro('');
      if (isbnInputRef.current) {
        isbnInputRef.current.focus();
      }
    } catch (error) {
      console.error('Erro ao registrar a venda:', error);
      setErro('Erro ao registrar a venda. Tente novamente.');
    }
  };

  // Busca cliente por CPF ao digitar 11 dígitos
  useEffect(() => {
    const buscarClientePorCpf = async () => {
      if (novoCliente.cpf && novoCliente.cpf.length === 11) {
        setLoadingCpf(true);
        try {
          const response = await axios.get(`${apiUrl}/cliente/${novoCliente.cpf}`);
          if (response.data) {
            const clienteEncontrado = response.data;
            // Atualiza o estado do novoCliente com os dados encontrados
            setNovoCliente({
              nome: clienteEncontrado.nome || '',
              cpf: clienteEncontrado.cpf || '',
              email: clienteEncontrado.email || '',
              telefone: clienteEncontrado.telefone || '',
              cep: clienteEncontrado.cep || '',
              endereco: clienteEncontrado.endereco || '',
              bairro: clienteEncontrado.bairro || '',
              cidade: clienteEncontrado.cidade || '',
              estado: clienteEncontrado.estado || ''
            });
            setClienteEncontrado(true);
          } else {
            setClienteEncontrado(false);
          }
        } catch (error) {
          setClienteEncontrado(false);
        } finally {
          setLoadingCpf(false);
        }
      } else {
        setClienteEncontrado(false);
      }
    };
    buscarClientePorCpf();
    // eslint-disable-next-line
  }, [novoCliente.cpf]);

  // Busca endereço pelo CEP ao digitar 8 dígitos
  useEffect(() => {
    const buscarEnderecoPorCep = async () => {
      if (novoCliente.cep && novoCliente.cep.length === 8) {
        setLoadingCep(true);
        try {
          const response = await fetch(`https://viacep.com.br/ws/${novoCliente.cep}/json/`);
          const data = await response.json();
          if (!data.erro) {
            setNovoCliente(prev => ({
              ...prev,
              endereco: data.logradouro || '',
              bairro: data.bairro || '',
              cidade: data.localidade || '',
              estado: data.uf || ''
            }));
          }
        } catch (error) {
          // Não faz nada se não encontrar
        } finally {
          setLoadingCep(false);
        }
      }
    };
    buscarEnderecoPorCep();
    // eslint-disable-next-line
  }, [novoCliente.cep]);

  return (
    <div className="NovaVenda">
      {showModal && (
        <div className="modal">
          {/* Conteúdo do modal */}
        </div>
      )}

      {showClienteModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={handleFecharClienteModal}>&times;</span>
            <h3>Adicionar Cliente</h3>
            <form onSubmit={handleSalvarNovoCliente}>
              <input type="text" name="nome" value={novoCliente.nome} onChange={handleInputChangeCliente} placeholder="Nome" required />
              <input type="text" name="cpf" value={novoCliente.cpf} onChange={handleInputChangeCliente} placeholder="CPF" />
              {loadingCpf && <span className="spinner" />}
              <input type="email" name="email" value={novoCliente.email} onChange={handleInputChangeCliente} placeholder="Email" />
              <input type="text" name="telefone" value={novoCliente.telefone} onChange={handleInputChangeCliente} placeholder="Telefone" />
              <input type="text" name="cep" value={novoCliente.cep} onChange={handleInputChangeCliente} placeholder="CEP" />
              {loadingCep && <span className="spinner" />}
              <input type="text" name="endereco" value={novoCliente.endereco} onChange={handleInputChangeCliente} placeholder="Endereço" />
              <input type="text" name="bairro" value={novoCliente.bairro} onChange={handleInputChangeCliente} placeholder="Bairro" />
              <input type="text" name="cidade" value={novoCliente.cidade} onChange={handleInputChangeCliente} placeholder="Cidade" />
              <input type="text" name="estado" value={novoCliente.estado} onChange={handleInputChangeCliente} placeholder="Estado" />
              <div className="botoes-cliente">
                <button type="submit" className="btn-registrar-venda">
                  {clienteEncontrado ? 'Vincular Cliente' : 'Cadastrar Cliente'}
                </button>
                <button type="button" className="btn-cancelar-cliente" onClick={handleFecharClienteModal}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="input-group">
        <label htmlFor="isbn">Nova Venda</label>
        <div className="input-container">
          <input
            ref={isbnInputRef}
            type="text"
            id="isbn"
            placeholder="Digite o ISBN do livro..."
            value={isbn}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            autoFocus
          />
          <div className="switch-container">
            <label className="switch">
              <input type="checkbox" checked={isSaldo} onChange={handleSwitchChange} />
              <span className="slider"></span>
            </label>
            <span>{isSaldo ? 'Saldo' : 'Novo'}</span>
          </div>
        </div>
        {erro && <p className="erro">{erro}</p>}
      </div>

      {livros.length > 0 && (
        <div className="lista-livros">
          <table>
            <thead>
              <tr>
                <th>Capa</th>
                <th>Livro</th>
                <th>ISBN</th>
                <th>Editora</th>
                <th>PVP</th>
                <th>Preço Feira</th>
                <th>Quantidade</th>
                <th>Desconto (%)</th>
                <th>Subtotal</th>
                <th>Remover</th>
              </tr>
            </thead>
            <tbody>
              {livros.map((livro, index) => (
                <tr key={index}>
                  <td>
                    <div className={`nova-venda-capa ${imageLoadErrors[livro.ISBN] ? 'sem-imagem' : ''}`}>
                      {!imageLoadErrors[livro.ISBN] ? (
                        <img
                          src={`${apiUrl}/imagem/${livro.ISBN}.jpg`}
                          alt={`Capa do livro ${livro.Título}`}
                          onError={() => handleImageError(livro.ISBN)}
                        />
                      ) : (
                        <FaBook />
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="livro-info">
                      <strong>{livro.Título}</strong>
                      <span>{livro.Autor}</span>
                    </div>
                  </td>
                  <td>{livro.ISBN}</td>
                  <td>{livro.Editora}</td>
                  <td style={{ textDecoration: 'line-through', color: 'red' }}>
                    R${livro.Valor.toFixed(2)}
                  </td>
                  <td style={{ color: 'green' }}>
                    R${isSaldo ? livro['Preço Saldo'].toFixed(2) : livro['Valor Feira'].toFixed(2)}
                  </td>
                  <td>
                    <div className="quantidade-buttons">
                      <FaMinusCircle 
                        onClick={() => handleEditQuantidade(livro, Math.max(1, livro.Quantidade - 1))}
                      />
                      <span className="quantidade">{livro.Quantidade}</span>
                      <FaPlusCircle 
                        onClick={() => handleEditQuantidade(
                          livro, 
                          Math.min(
                            livro.Quantidade + 1, 
                            isSaldo ? livro['Estoque Saldo'] : livro.Estoque
                          )
                        )}
                      />
                    </div>
                  </td>
                  <td>
                    <input
                      className="discount-input"
                      type="number"
                      value={livro.Desconto || 0}
                      onChange={(event) => handleDescontoChange(livro, event)}
                    />
                  </td>
                  <td>R${calcularSubtotal(livro)}</td>
                  <td>
                    <button className="remove-button" onClick={() => handleRemoveLivro(livro.ISBN)}>
                      <FaTrashAlt />
                    </button>
                  </td>
                </tr>
              ))}
              <tr className="total-row">
                <td colSpan="5">Totais:</td>
                <td>{totalQuantidade}</td>
                <td></td>
                <td>R${totalPrecoDesconto.toFixed(2)}</td>
                <td></td>
              </tr>
            </tbody>
          </table>

          <div className="forma-pagamento">
            <select
              id="formaPagamento"
              className="select-forma-pagamento"
              value={formaPagamento}
              onChange={(e) => setFormaPagamento(e.target.value)}
            >
              <option value="Outros">Outros</option>
              <option value="Crédito">Crédito</option>
              <option value="Débito">Débito</option>
              <option value="Pix">Pix</option>
              <option value="Dinheiro">Dinheiro</option>
            </select>
          </div>

          <div className="cliente-info">
            {cliente.nome ? (
              <div className="cliente-vinculado">
                <div className="cliente-detalhes">
                  <h4>Cliente Vinculado</h4>
                  <p><strong>Nome:</strong> {cliente.nome}</p>
                  <p><strong>CPF:</strong> {cliente.cpf}</p>
                  <p><strong>Email:</strong> {cliente.email}</p>
                  <p><strong>Telefone:</strong> {cliente.telefone}</p>
                  <p><strong>Endereço:</strong> {cliente.endereco}, {cliente.bairro}</p>
                  <p><strong>Cidade/UF:</strong> {cliente.cidade}/{cliente.estado}</p>
                </div>
                <button className="btn-alterar-cliente" onClick={handleAbrirClienteModal}>
                  <FaUserPlus /> Alterar Cliente
                </button>
              </div>
            ) : (
              <button className="btn-add-cliente" onClick={handleAbrirClienteModal}>
                <FaUserPlus /> Adicionar Cliente
              </button>
            )}
          </div>

          <div className="buttons-container">
            <button className="btn-registrar-venda" onClick={handleRegistrarVenda}>
              <FaShoppingCart /> Registrar Venda
            </button>
          </div>
        </div>
      )}

      
    </div>
  );
}

export default NovaVenda;
