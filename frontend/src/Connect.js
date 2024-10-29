// src/App.js
import React from 'react';
import QRCode from 'qrcode.react';
import apiUrl from './config';

function Connect() {
  // URL com a porta original
  const originalUrl = apiUrl;

  // URL com a porta alterada para 3001
  const newUrl = originalUrl.replace(/:(\d+)/, ':3001');

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Para utilizar a versão mobile, siga os passos abaixo:</h1>
      <div style={{ margin: '20px' }}>
        <h2>Conectar ao Backend</h2>
        <QRCode value={originalUrl} />
        <p>{originalUrl}</p>
      </div>
      <div style={{ margin: '20px' }}>
        <h2>Acessar o Sistema</h2>
        <QRCode value={newUrl} />
        <p>{newUrl}</p>
      </div>
    </div>
  );
}

export default Connect;
