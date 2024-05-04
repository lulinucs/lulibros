import React, { useState, useEffect } from 'react';
import apiUrl from './config';
import axios from 'axios';
import './ListarLivros.css'; // Importando os estilos CSS

const LivrosComponent = () => {
  const [livros, setLivros] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLivro, setSelectedLivro] = useState(null); // Estado para o livro selecionado
  const [modalOpen, setModalOpen] = useState(false); // Estado para controlar a abertura/fechamento do modal
  const [editMode, setEditMode] = useState(false); // Estado para controlar o modo de edição
  const [editedValue, setEditedValue] = useState(0); // Estado para armazenar o valor editado
  const [editedEstoque, setEditedEstoque] = useState(0); // Estado para armazenar o estoque editado

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
    setEditedValue(livro['Valor Feira']); // Atualiza o estado com o valor atual do livro
    setEditedEstoque(livro.Estoque); // Atualiza o estado com o estoque atual do livro
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedLivro(null);
    setModalOpen(false);
    setEditMode(false); // Fechar o modal também desativa o modo de edição
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

  const handleSaveChanges = async () => {
    try {
      await axios.put(`${apiUrl}/livros/${selectedLivro._id}`, {
        ['Valor Feira']: editedValue,
        Estoque: editedEstoque,
      });
      // Atualiza a lista de livros após a edição
      const updatedLivros = livros.map((livro) => {
        if (livro._id === selectedLivro._id) {
          return { ...livro, 'Valor Feira': editedValue, Estoque: editedEstoque };
        }
        return livro;
      });
      setLivros(updatedLivros);
      closeModal();
    } catch (error) {
      console.error('Erro ao salvar alterações:', error);
    }
  };

  return (
    <div className="listar-livros-container">
      <h1 className="listar-livros-title">Lista de Livros</h1>
      <div className="busca-container">
        <input type="text" value={searchTerm} onChange={handleSearchChange} placeholder="Pesquisar por título, autor ou editora" />
      </div>
      <div className="livros-grid">
        {livros.map((livro, index) => (
          <div key={index} className="livro-card" onClick={() => openModal(livro)}> {/* Adiciona evento de clique */}
            <div className="livro-info">
              <p><strong>ISBN:</strong> {livro.ISBN}</p>
              <p><strong>Título:</strong> {livro.Título}</p>
              <p><strong>Valor Feira:</strong> {livro['Valor Feira'].toFixed(2)}</p>
              <p><strong>Estoque:</strong> {livro.Estoque}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="pagination">
        <button onClick={handlePrevPage} disabled={currentPage === 1}>Anterior</button>
        <span>Página {currentPage} de {totalPages}</span>
        <button onClick={handleNextPage} disabled={currentPage === totalPages}>Próxima</button>
      </div>
      {/* Modal */}
      {modalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeModal}>&times;</span>
            <h2>Detalhes do Livro</h2>
            {selectedLivro && (
              <div>
                <p><strong>ISBN:</strong> {selectedLivro.ISBN}</p>
                <p><strong>Título:</strong> {selectedLivro.Título}</p>
                {editMode ? (
                  <>
                    <p><strong>Valor Feira:</strong> <input type="number" value={editedValue} onChange={handleValueChange} /></p>
                    <p><strong>Estoque:</strong> <input type="number" value={editedEstoque} onChange={handleEstoqueChange} /></p>
                  </>
                ) : (
                  <>
                    <p><strong>Valor Feira:</strong> {`R$ ${selectedLivro['Valor Feira'].toFixed(2)}`}</p>
                    <p><strong>Estoque:</strong> {selectedLivro.Estoque}</p>
                  </>
                )}
                <p><strong>Autor:</strong> {selectedLivro.Autor}</p>
                <p><strong>Editora:</strong> {selectedLivro.Editora}</p>
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
