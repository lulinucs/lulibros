import React, { useState } from 'react';
import axios from 'axios';
import './NovaVenda.css';
import apiUrl from './config'; // Importe a variável apiUrl
import { FaTrashAlt, FaMinusCircle, FaPlusCircle, FaUserPlus, FaShoppingCart } from 'react-icons/fa';

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
  const [formaPagamento, setFormaPagamento] = useState('');

  const handleInputChange = (event) => {
    setIsbn(event.target.value);
  };

  const handleKeyPress = async (event) => {
  if (event.key === 'Enter') {
    // Pergunta se é "Saldo" ou "Novo"
    const isSaldo = window.confirm("Este livro é 'Saldo'? Clique em 'OK' para Sim e 'Cancel' para Novo.");

    // Determina o tipo baseado na resposta
    const tipoLivro = isSaldo ? 'Saldo' : 'Novo';

    try {
      const response = await fetch(`${apiUrl}/livro/${isbn}`);
      if (!response.ok) {
        throw new Error('Livro não encontrado');
      }
      const data = await response.json();
      const livroExistente = livros.find((livro) => livro.ISBN === data.livro.ISBN);
      if (livroExistente) {
        if (livroExistente.Quantidade < data.livro.Estoque) {
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
        if (data.livro.Estoque >= 1) {
          // Adiciona o tipo do livro ao objeto
          setLivros([...livros, { ...data.livro, Quantidade: 1, Desconto: 0, Tipo: tipoLivro }]);
          setErro('');
        } else {
          setErro('O estoque deste livro é menor que 1');
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
    setCliente({ ...cliente, [name]: value });
  };

  const handleCancelarCliente = () => {
    setShowModal(false);
    setCliente({
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
    const precoDesconto = calcularPrecoComDesconto(livro['Valor Feira'], livro.Desconto);
    return (precoDesconto * livro.Quantidade).toFixed(2);
  };

  const totalQuantidade = livros.reduce((acc, livro) => acc + livro.Quantidade, 0);
  const totalPrecoDesconto = livros.reduce((acc, livro) => acc + Number(calcularSubtotal(livro)), 0);

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
          subtotal: calcularPrecoComDesconto(livro['Valor Feira'], livro.Desconto),
        })),
        total: totalPrecoDesconto,
        formaPagamento: formaPagamento, // Adiciona a forma de pagamento
      });
      console.log('Venda registrada com sucesso:', response.data);
      setLivros([]);
      setCliente({
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
      setFormaPagamento(''); // Limpar forma de pagamento
      setErro('');
    } catch (error) {
      console.error('Erro ao registrar a venda:', error);
    }
  };
  

  return (
    <div className="NovaVenda">
      {showModal && (
        <div className="modal">
          {/* Conteúdo do modal */}
        </div>
      )}

      <div className="input-group">
        <label htmlFor="isbn">Nova Venda</label>
        <input
          type="text"
          id="isbn"
          placeholder="Digite o ISBN do livro..."
          value={isbn}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
        />
      </div>

      {livros.length > 0 && (
        <div className="lista-livros">
          <table>
            <thead>
              <tr>
                <th>ISBN</th>
                <th>Título</th>
                <th>Editora</th>
                <th>Autor</th>
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
                  <td>{livro.ISBN}</td>
                  <td>{livro.Título}</td>
                  <td>{livro.Editora}</td>
                  <td>{livro.Autor}</td>
                  <td style={{ textDecoration: 'line-through', color: 'red' }}>R${livro.Valor.toFixed(2)}</td>
                  <td style={{ color: 'green' }}>R${livro['Valor Feira'].toFixed(2)}</td>
                  <td>
                    <div className="quantidade-buttons">
                      <FaMinusCircle onClick={() => handleEditQuantidade(livro, Math.max(1, livro.Quantidade - 1))} />
                      <span className="quantidade">{livro.Quantidade}</span>
                      <FaPlusCircle onClick={() => handleEditQuantidade(livro, Math.min(livro.Quantidade + 1, livro.Estoque))} />
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
                <td colSpan="6">Totais:</td>
                <td>{totalQuantidade}</td>
                <td></td>
                <td>R${totalPrecoDesconto.toFixed(2)}</td>
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
              <option value="">Forma de Pagamento</option>
              <option value="Crédito">Crédito</option>
              <option value="Débito">Débito</option>
              <option value="Pix">Pix</option>
              <option value="Dinheiro">Dinheiro</option>
              <option value="Outro">Outro</option>
            </select>
          </div>


          {cliente.nome && <p>Nome do Cliente: {cliente.nome.split(' ')[0]}</p>}
          <div className="buttons-container">
            {/*<button className="btn-add-cliente" onClick={handleAddCliente}><FaUserPlus /> Adicionar Cliente</button>*
            */}<button className="btn-registrar-venda" onClick={handleRegistrarVenda}><FaShoppingCart />Registrar Venda</button>
          </div>
        </div>
      )}

      {erro && <p className="erro">{erro}</p>}
    </div>
  );
}

export default NovaVenda;
