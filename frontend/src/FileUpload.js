import React, { useState, useCallback } from 'react';
import axios from 'axios';
import './FileUpload.css';
import apiUrl from './config';
import { FaFileUpload, FaDownload, FaCheck } from 'react-icons/fa';

const FileUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploadType, setUploadType] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      setSelectedFile(file);
      setUploadMessage('');
    } else {
      setUploadMessage('Por favor, selecione um arquivo Excel válido (.xlsx ou .xls)');
    }
  };

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      setSelectedFile(file);
      setUploadMessage('');
    } else {
      setUploadMessage('Por favor, arraste um arquivo Excel válido (.xlsx ou .xls)');
    }
  }, []);

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadMessage('Nenhum arquivo selecionado');
      return;
    }

    if (!uploadType) {
      setUploadMessage('Selecione o tipo de upload: Adicionar ou Substituir Estoque');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('estoque', selectedFile);

    try {
      let url = '';
      if (uploadType === 'adicionar') {
        url = `${apiUrl}/adicionar-estoque`;
      } else if (uploadType === 'substituir') {
        url = `${apiUrl}/substituir-estoque`;
      }

      const response = await axios.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setUploadMessage(response.data.message);
      setSelectedFile(null);
      document.querySelector('input[type="file"]').value = '';
    } catch (error) {
      console.error('Erro ao fazer upload do arquivo:', error);
      setUploadMessage('Erro ao fazer upload do arquivo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadModelo = () => {
    window.open(`${apiUrl}/modelo-estoque`, '_blank');
  };

  return (
    <div className="FileUploadContainer">
      <h2>Upload de Arquivo de Estoque</h2>
      
      <div className="upload-section">
        <div className="file-input-wrapper">
          <label 
            className={`file-input-label ${isDragging ? 'dragging' : ''}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input type="file" onChange={handleFileChange} accept=".xlsx,.xls" />
            <div className="file-input-text">
              <FaFileUpload />
              {selectedFile ? (
                <>
                  <span className="file-name">{selectedFile.name}</span>
                  <span className="file-size">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                </>
              ) : (
                <>
                  <span>Arraste um arquivo Excel ou clique para selecionar</span>
                  <span className="file-hint">.xlsx ou .xls</span>
                </>
              )}
            </div>
          </label>
          
          <a href="#" onClick={handleDownloadModelo} className="modelo-link">
            <FaDownload />
            Baixar modelo de planilha
          </a>
        </div>

        <div className="radio-group">
          <label className="radio-label">
            <input
              type="radio"
              value="adicionar"
              checked={uploadType === 'adicionar'}
              onChange={() => setUploadType('adicionar')}
            />
            <span>Adicionar Estoque</span>
          </label>
          
          <label className="radio-label">
            <input
              type="radio"
              value="substituir"
              checked={uploadType === 'substituir'}
              onChange={() => setUploadType('substituir')}
            />
            <span>Substituir Estoque</span>
          </label>
        </div>

        <button 
          className="upload-button" 
          onClick={handleUpload}
          disabled={isUploading || !selectedFile}
        >
          {isUploading ? 'Enviando...' : 'Enviar Arquivo'}
        </button>

        {uploadMessage && (
          <div className={`upload-message ${uploadMessage.includes('Erro') ? 'error' : 'success'}`}>
            {uploadMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
