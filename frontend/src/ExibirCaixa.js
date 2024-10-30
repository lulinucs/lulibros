import React, { useState, useEffect } from 'react';
import axios from 'axios';
import apiUrl from './config';
import './ExibirCaixa.css';

const Financeiro = () => {
  const [cashData, setCashData] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchCashData(date);
  }, [date]);

  const fetchCashData = async (selectedDate) => {
    try {
      const response = await axios.get(`${apiUrl}/caixa`, {
        params: { data: selectedDate }
      });
      setCashData(response.data);
    } catch (error) {
      console.error('Erro ao buscar caixa:', error);
      setMessage(error.response?.data?.mensagem || 'Erro ao buscar caixa.');
    }
  };

  const handleDateChange = (e) => {
    setDate(e.target.value);
  };

  return (
    <div className="financeiro-container">
      <h2>Financeiro</h2>

      {message && <div className="server-message">{message}</div>}

      <div className="cash-display">
        <h3>Exibir Caixa</h3>
        <label htmlFor="date">Data:</label>
        <input
          type="date"
          id="date"
          name="date"
          value={date}
          onChange={handleDateChange}
        />
        <button onClick={() => fetchCashData(date)}>Ver Caixa</button>

        <div className="cash-info">
          {cashData.length > 0 ? (
            cashData.map((caixa, index) => (
              <div key={index} className="cash-item">
                <h4>{caixa.dataFechamento ? 'Caixa Fechado' : 'Caixa Aberto'}</h4>
                <p><strong>Data:</strong> {new Date(caixa.data).toLocaleDateString()}</p>
                <p><strong>Nome Abertura:</strong> {caixa.nomeAbertura}</p>
                <p><strong>Fundo de Caixa:</strong> R$ {caixa.fundoCaixa}</p>

                <div className="section">
                  <h5>Vendas Registradas</h5>
                  <p><strong>Dinheiro:</strong> R$ {caixa.vendasDinheiro}</p>
                  <p><strong>Crédito:</strong> R$ {caixa.vendasCredito}</p>
                  <p><strong>Débito:</strong> R$ {caixa.vendasDebito}</p>
                  <p><strong>Pix:</strong> R$ {caixa.vendasPix}</p>
                  <p><strong>Outros:</strong> R$ {caixa.vendasOutros}</p>
                </div>

                <div className="section">
                  <h5>Valores Declarados</h5>
                  <p><strong>Crédito:</strong> R$ {caixa.credito}</p>
                  <p><strong>Débito:</strong> R$ {caixa.debito}</p>
                  <p><strong>Pix:</strong> R$ {caixa.pix}</p>
                  <p><strong>Outros:</strong> R$ {caixa.outros}</p>
                </div>

                <div className="section">
                  <h5>Diferenças</h5>
                  <p><strong>Diferença Crédito:</strong> R$ {caixa.diferencaCredito}</p>
                  <p><strong>Diferença Débito:</strong> R$ {caixa.diferencaDebito}</p>
                  <p><strong>Diferença Dinheiro:</strong> R$ {caixa.diferencaDinheiro}</p>
                  <p><strong>Diferença Pix:</strong> R$ {caixa.diferencaPix}</p>
                  <p><strong>Diferença Outros:</strong> R$ {caixa.diferencaOutros}</p>
                </div>
              </div>
            ))
          ) : (
            <p>Nenhum registro de caixa encontrado para a data selecionada.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Financeiro;
