import React, { useState } from 'react';
import apiUrl from './config'; // Importe a variável apiUrl
import BarcodeScanner from './BarcodeScanner'; // Importe o componente BarcodeScanner
import { FaBarcode, FaShoppingCart } from 'react-icons/fa'; // Importe o ícone de carrinho de compras
import './PesquisaLivro.css';

function PesquisaLivro() {
  const [isbn, setIsbn] = useState('');
  const [livro, setLivro] = useState(null);
  const [erro, setErro] = useState('');
  const [showScanner, setShowScanner] = useState(false); // Estado para controlar a exibição do BarcodeScanner

  const handleInputChange = (event) => {
    setIsbn(event.target.value);
  };

  const handleKeyPress = async (event) => {
    if (event.key === 'Enter') {
      await searchBook(isbn); // Move a lógica de pesquisa para uma função separada
    }
  };

  // Função para pesquisar um livro
  const searchBook = async (isbn) => {
    try {
      const response = await fetch(`${apiUrl}/livro/${isbn}`);
      if (!response.ok) {
        throw new Error('Livro não encontrado');
      }
      const data = await response.json();
      setLivro(data.livro);
      setErro('');
    } catch (error) {
      setLivro(null);
      setErro(error.message);
    }
  };

  // Função para lidar com a leitura do código de barras
  const handleBarcodeScan = (result) => {
    setIsbn(result);
    setShowScanner(false);
    // Dispara a busca do livro automaticamente, como se o usuário tivesse pressionado Enter
    searchBook(result);
  };

  // Função para abrir o scanner
  const openScanner = () => {
    setShowScanner(true);
  };

  // Função para registrar a venda do livro pesquisado
  const handleRegistrarVenda = async () => {
    try {
      const response = await fetch(`${apiUrl}/registrar-venda`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cliente: null, // Informe o ID do cliente se necessário
          livros: [{
            livro: livro._id,
            quantidade: 1, // Apenas uma unidade do livro
            desconto: livro['Valor Feira'], // Desconto igual ao valor 'Valor Feira'
            subtotal: livro['Valor Feira'], // Subtotal igual ao valor 'Valor Feira'
          }],
          total: livro['Valor Feira'], // Total igual ao valor 'Valor Feira'
        }),
      });
      if (!response.ok) {
        throw new Error('Erro ao registrar a venda');
      }
      console.log('Venda registrada com sucesso:', response.data);
      // Limpar estado após o registro da venda
      setLivro(null);
      setErro('');
    } catch (error) {
      console.error('Erro ao registrar a venda:', error);
    }
  };

  return (
    <div className="PesquisaLivro">
      <h1>Venda Rápida</h1>
      <div className="input-group">
        <label htmlFor="isbn">ISBN</label>
        <div className="input-with-button">
          <input
            type="text"
            id="isbn"
            placeholder="Digite o ISBN do livro..."
            value={isbn}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
          />
          <button className="barcode-button" onClick={openScanner}>
            <FaBarcode /> {/* Ícone de código de barras */}
          </button>
        </div>
      </div>
      {/* Renderizar o BarcodeScanner apenas se showScanner for verdadeiro */}
      {showScanner && <BarcodeScanner onResult={handleBarcodeScan} />}
      {livro && (
        <div className="livro-detalhes">
          <h2>{livro.Título}</h2>
          <p><strong>ISBN:</strong> {livro.ISBN}</p>
          <p><strong>Editora:</strong> {livro.Editora}</p>
          <p><strong>Autor:</strong> {livro.Autor}</p>
          <p><strong>Valor:</strong> R${livro.Valor.toFixed(2)}</p>
          <p><strong>Valor Feira:</strong> R${livro['Valor Feira'].toFixed(2)}</p>
          <p><strong>Estoque:</strong> {livro.Estoque}</p>
          {/* Botão para registrar a venda */}
          <button
            className={`register-sale-button ${livro.Estoque < 1 ? 'disabled-button' : ''}`}
            onClick={handleRegistrarVenda}
            disabled={livro.Estoque < 1}
          >
            <FaShoppingCart /> {/* Ícone de carrinho de compras */}
          </button>
        </div>
      )}
      {erro && <p className="erro">{erro}</p>}
    </div>
  );
}

export default PesquisaLivro;
