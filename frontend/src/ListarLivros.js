import React, { useState, useEffect } from 'react';
import apiUrl from './config';
import axios from 'axios';
import './ListarLivros.css';

const LivrosComponent = () => {
  const [livros, setLivros] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLivro, setSelectedLivro] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedValue, setEditedValue] = useState(0);
  const [editedEstoque, setEditedEstoque] = useState(0);
  const [editedEstoqueSaldo, setEditedEstoqueSaldo] = useState(0);
  const [editedPrecoSaldo, setEditedPrecoSaldo] = useState(0);
  const [filtro, setFiltro] = useState('Todos'); // Estado do filtro

  useEffect(() => {
    const fetchLivros = async () => {
      try {
        const response = await axios.get(`${apiUrl}/livros?page=${currentPage}&q=${searchTerm}`);
        setLivros(response.data.livros);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error('Erro ao buscar os livros:', error);
      }
    };

    fetchLivros();
  }, [apiUrl, currentPage, searchTerm]);

  const handleFilterChange = (event) => {
    setFiltro(event.target.value);
  };

  const filterLivros = () => {
    return livros.filter((livro) => {
      if (filtro === 'Com Saldo') return livro['Estoque Saldo'] > 0;
      if (filtro === 'Novos') return livro.Estoque > 0;
      return true; // 'Todos'
    });
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const openModal = (livro) => {
    setSelectedLivro(livro);
    setEditedValue(livro['Valor Feira']);
    setEditedEstoque(livro.Estoque);
    setEditedEstoqueSaldo(livro['Estoque Saldo']);
    setEditedPrecoSaldo(livro['Preço Saldo']);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedLivro(null);
    setModalOpen(false);
    setEditMode(false);
  };

  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  const handleValueChange = (event) => {
    setEditedValue(parseFloat(event.target.value));
  };

  const handleEstoqueChange = (event) => {
    setEditedEstoque(parseInt(event.target.value));
  };

  const handleEstoqueSaldoChange = (event) => {
    setEditedEstoqueSaldo(parseInt(event.target.value));
  };

  const handlePrecoSaldoChange = (event) => {
    setEditedPrecoSaldo(parseFloat(event.target.value));
  };

  const handleSaveChanges = async () => {
    try {
      await axios.put(`${apiUrl}/livros/${selectedLivro._id}`, {
        ValorFeira: editedValue,
        Estoque: editedEstoque,
        EstoqueSaldo: editedEstoqueSaldo,
        PrecoSaldo: editedPrecoSaldo,
      });
      const updatedLivros = livros.map((livro) => {
        if (livro._id === selectedLivro._id) {
          return {
            ...livro,
            'Valor Feira': editedValue,
            Estoque: editedEstoque,
            'Estoque Saldo': editedEstoqueSaldo,
            'Preço Saldo': editedPrecoSaldo,
          };
        }
        return livro;
      });
      setLivros(updatedLivros);
      closeModal();
      alert('Livro atualizado com sucesso!'); // Notificação de sucesso
    } catch (error) {
      console.error('Erro ao salvar alterações:', error);
      alert('Erro ao atualizar livro. Por favor, tente novamente.'); // Notificação de erro
    }
  };

  return (
    <div className="listar-livros-container">
      <h1 className="listar-livros-title">Lista de Livros</h1>
      <div className="busca-container">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Pesquisar por título, autor ou editora"
        />
      </div>
      <div className="filter-container">
        <label htmlFor="filtro">Filtrar por:</label>
        <select id="filtro" value={filtro} onChange={handleFilterChange}>
          <option value="Todos">Todos</option>
          <option value="Com Saldo">Com Saldo</option>
          <option value="Novos">Novos</option>
        </select>
      </div>
      <div className="livros-grid">
        {filterLivros().map((livro, index) => (
          <div key={index} className="livro-card" onClick={() => openModal(livro)}>
            <div className="livro-info">
              <p><strong>ISBN:</strong> {livro.ISBN}</p>
              <p><strong>Título:</strong> {livro.Título}</p>
              <p><strong>Editora:</strong> {livro.Editora}</p>
              <p><strong>Autor:</strong> {livro.Autor}</p>
              <div className="disponibilidade-table">
                <p><strong>DISPONIBILIDADE</strong></p>
                <div className="disponibilidade-row">
                  <span>Novo: {livro.Estoque} | Preço: R$ {livro['Valor Feira'].toFixed(2)}</span>
                </div>
                <div className="disponibilidade-row">
                  <span>Saldo: {livro['Estoque Saldo']} | Preço: R$ {livro['Preço Saldo'].toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="pagination">
        <button onClick={handlePrevPage} disabled={currentPage === 1}>Anterior</button>
        <span>Página {currentPage} de {totalPages}</span>
        <button onClick={handleNextPage} disabled={currentPage === totalPages}>Próxima</button>
      </div>
      {modalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeModal}>&times;</span>
            <h2>Detalhes do Livro</h2>
            {selectedLivro && (
              <div>
                <p><strong>ISBN:</strong> {selectedLivro.ISBN}</p>
                <p><strong>Título:</strong> {selectedLivro.Título}</p>
                <p><strong>Editora:</strong> {selectedLivro.Editora}</p>
                <p><strong>Autor:</strong> {selectedLivro.Autor}</p>
                <div className="disponibilidade-table">
                  <p><strong>DISPONIBILIDADE</strong></p>
                  {editMode ? (
                    <>
                      <div className="disponibilidade-row">
                        <span>Novo: <input type="number" value={editedEstoque} onChange={handleEstoqueChange} /> | Preço: <input type="number" value={editedValue} onChange={handleValueChange} /></span>
                      </div>
                      <div className="disponibilidade-row">
                        <span>Saldo: <input type="number" value={editedEstoqueSaldo} onChange={handleEstoqueSaldoChange} /> | Preço: <input type="number" value={editedPrecoSaldo} onChange={handlePrecoSaldoChange} /></span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="disponibilidade-row">
                        <span>Novo: {selectedLivro.Estoque} | Preço: R$ {selectedLivro['Valor Feira'].toFixed(2)}</span>
                      </div>
                      <div className="disponibilidade-row">
                        <span>Saldo: {selectedLivro['Estoque Saldo']} | Preço: R$ {selectedLivro['Preço Saldo'].toFixed(2)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
            <button onClick={editMode ? handleSaveChanges : toggleEditMode}>{editMode ? 'Salvar' : 'Editar'}</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LivrosComponent;
