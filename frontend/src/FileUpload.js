import React, { useState } from 'react';
import axios from 'axios';
import './FileUpload.css'
import apiUrl from './config';

const FileUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploadType, setUploadType] = useState('');

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadMessage('Nenhum arquivo selecionado');
      return;
    }

    if (!uploadType) {
      setUploadMessage('Selecione o tipo de upload: Adicionar ou Substituir Estoque');
      return;
    }

    const formData = new FormData();
    formData.append('estoque', selectedFile);

    try {
      let url = '';
      if (uploadType === 'adicionar') {
        url = `${apiUrl}/adicionar-estoque`; // Construa a URL usando a variável apiUrl
      } else if (uploadType === 'substituir') {
        url = `${apiUrl}/substituir-estoque`; // Construa a URL usando a variável apiUrl
      }

      const response = await axios.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setUploadMessage(response.data.message);
    } catch (error) {
      console.error('Erro ao fazer upload do arquivo:', error);
      setUploadMessage('Erro ao fazer upload do arquivo');
    }
  };

  return (
    <div className="FileUploadContainer">
      <h2>Upload de Arquivo de Estoque</h2>
      <div>
        <input type="file" onChange={handleFileChange} />
      </div>
      <div>
        <label>
          <input
            type="radio"
            value="adicionar"
            checked={uploadType === 'adicionar'}
            onChange={() => setUploadType('adicionar')}
          />
          Adicionar Estoque
        </label>
        <label>
          <input
            type="radio"
            value="substituir"
            checked={uploadType === 'substituir'}
            onChange={() => setUploadType('substituir')}
          />
          Substituir Estoque
        </label>
      </div>
      <button onClick={handleUpload}>Enviar</button>
      {uploadMessage && <p>{uploadMessage}</p>}
    </div>
  );
};

export default FileUpload;
