import React, { useState, useEffect } from 'react';
import apiUrl from './config';
import axios from 'axios';
import './ListarLivros.css';
import { FaBook } from 'react-icons/fa';

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
  const [filtro, setFiltro] = useState('Todos');
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todas');
  const [categorias, setCategorias] = useState([]);
  const [imageLoadErrors, setImageLoadErrors] = useState({});

  // Função para buscar todas as categorias únicas
  const fetchTodasCategorias = async () => {
    try {
      const response = await axios.get(`${apiUrl}/categorias`);
      const categoriasOrdenadas = response.data.sort((a, b) => a.localeCompare(b, 'pt-BR'));
      setCategorias(categoriasOrdenadas);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
    }
  };

  useEffect(() => {
    const fetchLivros = async () => {
      try {
        // Construir a URL com todos os parâmetros de filtro
        let url = `${apiUrl}/livros?page=${currentPage}`;
        
        if (searchTerm) {
          url += `&q=${searchTerm}`;
        }
        
        if (categoriaFiltro !== 'Todas') {
          url += `&categoria=${encodeURIComponent(categoriaFiltro)}`;
        }

        const response = await axios.get(url);
        setLivros(response.data.livros);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error('Erro ao buscar os livros:', error);
      }
    };

    fetchLivros();
  }, [currentPage, searchTerm, categoriaFiltro]);

  // Efeito separado para buscar categorias apenas uma vez na montagem
  useEffect(() => {
    fetchTodasCategorias();
  }, []);

  const handleImageError = (isbn) => {
    setImageLoadErrors(prev => ({ ...prev, [isbn]: true }));
  };

  const handleFilterChange = (event) => {
    setFiltro(event.target.value);
    setCurrentPage(1); // Reset para primeira página
  };

  const handleCategoriaChange = (event) => {
    setCategoriaFiltro(event.target.value);
    setCurrentPage(1); // Reset para primeira página
  };

  const filterLivros = () => {
    return livros.filter((livro) => {
      // Agora só precisamos filtrar por disponibilidade, já que categoria vem filtrada da API
      if (filtro === 'Com Saldo') return livro['Estoque Saldo'] > 0;
      if (filtro === 'Novos') return livro.Estoque > 0;
      return true;
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
    setCurrentPage(1); // Reset para primeira página
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
    } catch (error) {
      console.error('Erro ao salvar alterações:', error);
      alert('Erro ao atualizar livro. Por favor, tente novamente.');
    }
  };

  return (
    <div className="listar-livros-container">
      <h1 className="listar-livros-title">Catálogo de Livros</h1>
      
      <div className="busca-container">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Pesquisar por título, autor ou editora..."
        />
      </div>

      <div className="filtros-container">
        <div className="filter-group">
          <label htmlFor="filtro">Disponibilidade:</label>
          <select id="filtro" value={filtro} onChange={handleFilterChange}>
            <option value="Todos">Todos os Livros</option>
            <option value="Com Saldo">Livros em Saldo</option>
            <option value="Novos">Livros Novos</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="categoria">Categoria:</label>
          <select id="categoria" value={categoriaFiltro} onChange={handleCategoriaChange}>
            <option value="Todas">Todas as Categorias</option>
            {categorias.map(categoria => (
              <option key={categoria} value={categoria}>{categoria}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="livros-grid">
        {filterLivros().map((livro) => (
          <div key={livro._id} className="livro-card" onClick={() => openModal(livro)}>
            <div className={`listar-livros-capa ${imageLoadErrors[livro.ISBN] ? 'sem-imagem' : ''}`}>
              {!imageLoadErrors[livro.ISBN] ? (
                <img
                  src={`${apiUrl}/imagem/${livro.ISBN}.jpg`}
                  alt={`Capa do livro ${livro.Título}`}
                  onError={() => handleImageError(livro.ISBN)}
                />
              ) : (
                <div className="sem-imagem">
                  <FaBook />
                </div>
              )}
            </div>
            <div className="livro-info">
              <p className="titulo">{livro.Título}</p>
              <p className="autor">{livro.Autor}</p>
              <p>{livro.Editora}</p>
              {livro.Categoria && <p className="categoria">{livro.Categoria}</p>}
              <div className="disponibilidade-table">
                {livro.Estoque > 0 && (
                  <div className="disponibilidade-row">
                    <span>Novo:</span>
                    <span>R$ {livro['Valor Feira'].toFixed(2)}</span>
                  </div>
                )}
                {livro['Estoque Saldo'] > 0 && (
                  <div className="disponibilidade-row">
                    <span>Saldo:</span>
                    <span>R$ {livro['Preço Saldo'].toFixed(2)}</span>
                  </div>
                )}
                {livro.Estoque === 0 && livro['Estoque Saldo'] === 0 && (
                  <div className="disponibilidade-row indisponivel">
                    <span>Indisponível</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pagination">
        <button onClick={handlePrevPage} disabled={currentPage === 1}>
          Anterior
        </button>
        <span>Página {currentPage} de {totalPages}</span>
        <button onClick={handleNextPage} disabled={currentPage === totalPages}>
          Próxima
        </button>
      </div>

      {modalOpen && (
        <div className="modal" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <span className="close" onClick={closeModal}>&times;</span>
            {selectedLivro && (
              <div className="modal-grid">
                <div className="modal-capa">
                  {!imageLoadErrors[selectedLivro.ISBN] ? (
                    <img
                      src={`${apiUrl}/imagem/${selectedLivro.ISBN}.jpg`}
                      alt={`Capa do livro ${selectedLivro.Título}`}
                      onError={() => handleImageError(selectedLivro.ISBN)}
                    />
                  ) : (
                    <div className="sem-imagem">
                      <FaBook />
                    </div>
                  )}
                </div>
                <div className="modal-info">
                  <h2>{selectedLivro.Título}</h2>
                  <p><strong>Autor:</strong> {selectedLivro.Autor}</p>
                  <p><strong>Editora:</strong> {selectedLivro.Editora}</p>
                  {selectedLivro.Categoria && (
                    <p><strong>Categoria:</strong> {selectedLivro.Categoria}</p>
                  )}
                  <p><strong>ISBN:</strong> {selectedLivro.ISBN}</p>
                  
                  <div className="disponibilidade-table">
                    <h3>Disponibilidade</h3>
                    {editMode ? (
                      <>
                        <div className="disponibilidade-row">
                          <span>Novo:</span>
                          <div>
                            <input type="number" value={editedEstoque} onChange={e => setEditedEstoque(parseInt(e.target.value))} min="0" />
                            <input type="number" value={editedValue} onChange={e => setEditedValue(parseFloat(e.target.value))} min="0" step="0.01" />
                          </div>
                        </div>
                        <div className="disponibilidade-row">
                          <span>Saldo:</span>
                          <div>
                            <input type="number" value={editedEstoqueSaldo} onChange={e => setEditedEstoqueSaldo(parseInt(e.target.value))} min="0" />
                            <input type="number" value={editedPrecoSaldo} onChange={e => setEditedPrecoSaldo(parseFloat(e.target.value))} min="0" step="0.01" />
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="disponibilidade-row">
                          <span>Novo:</span>
                          <span>{selectedLivro.Estoque} unid. | R$ {selectedLivro['Valor Feira'].toFixed(2)}</span>
                        </div>
                        <div className="disponibilidade-row">
                          <span>Saldo:</span>
                          <span>{selectedLivro['Estoque Saldo']} unid. | R$ {selectedLivro['Preço Saldo'].toFixed(2)}</span>
                        </div>
                      </>
                    )}
                  </div>
                  <button onClick={editMode ? handleSaveChanges : () => setEditMode(true)}>
                    {editMode ? 'Salvar Alterações' : 'Editar'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LivrosComponent;
