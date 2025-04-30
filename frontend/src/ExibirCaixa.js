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

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div>
      <h2>Financeiro</h2>

      {message && <div className="server-message">{message}</div>}

      <div className="cash-display">
        <h3>Exibir Caixa</h3>
        <div className="date-controls">
          <input
            type="date"
            id="date"
            name="date"
            value={date}
            onChange={handleDateChange}
          />
          <button onClick={() => fetchCashData(date)}>Ver Caixa</button>
        </div>

        {cashData.length > 0 ? (
          <table className="cash-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Data</th>
                <th>Responsável</th>
                <th>Fundo de Caixa</th>
              </tr>
            </thead>
            <tbody>
              {cashData.map((caixa, index) => (
                <React.Fragment key={index}>
                  <tr>
                    <td>
                      <span className={`status-badge ${caixa.dataFechamento ? 'status-closed' : 'status-open'}`}>
                        {caixa.dataFechamento ? 'Fechado' : 'Aberto'}
                      </span>
                    </td>
                    <td>{new Date(caixa.data).toLocaleDateString()}</td>
                    <td>{caixa.nomeAbertura}</td>
                    <td>{formatCurrency(caixa.fundoCaixa)}</td>
                  </tr>
                  
                  <tr className="section-title">
                    <td colSpan="4">Vendas Registradas</td>
                  </tr>
                  <tr>
                    <td colSpan="4">
                      <table className="cash-table">
                        <tbody>
                          <tr>
                            <td>Dinheiro: {formatCurrency(caixa.vendasDinheiro)}</td>
                            <td>Crédito: {formatCurrency(caixa.vendasCredito)}</td>
                            <td>Débito: {formatCurrency(caixa.vendasDebito)}</td>
                            <td>Pix: {formatCurrency(caixa.vendasPix)}</td>
                            <td>Outros: {formatCurrency(caixa.vendasOutros)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>

                  <tr className="section-title">
                    <td colSpan="4">Valores Declarados</td>
                  </tr>
                  <tr>
                    <td colSpan="4">
                      <table className="cash-table">
                        <tbody>
                          <tr>
                            <td>Crédito: {formatCurrency(caixa.credito)}</td>
                            <td>Débito: {formatCurrency(caixa.debito)}</td>
                            <td>Pix: {formatCurrency(caixa.pix)}</td>
                            <td>Outros: {formatCurrency(caixa.outros)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>

                  <tr className="section-title">
                    <td colSpan="4">Diferenças</td>
                  </tr>
                  <tr>
                    <td colSpan="4">
                      <table className="cash-table">
                        <tbody>
                          <tr>
                            <td className={caixa.diferencaCredito >= 0 ? 'value-positive' : 'value-negative'}>
                              Crédito: {formatCurrency(caixa.diferencaCredito)}
                            </td>
                            <td className={caixa.diferencaDebito >= 0 ? 'value-positive' : 'value-negative'}>
                              Débito: {formatCurrency(caixa.diferencaDebito)}
                            </td>
                            <td className={caixa.diferencaDinheiro >= 0 ? 'value-positive' : 'value-negative'}>
                              Dinheiro: {formatCurrency(caixa.diferencaDinheiro)}
                            </td>
                            <td className={caixa.diferencaPix >= 0 ? 'value-positive' : 'value-negative'}>
                              Pix: {formatCurrency(caixa.diferencaPix)}
                            </td>
                            <td className={caixa.diferencaOutros >= 0 ? 'value-positive' : 'value-negative'}>
                              Outros: {formatCurrency(caixa.diferencaOutros)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Nenhum registro de caixa encontrado para a data selecionada.</p>
        )}
      </div>
    </div>
  );
};

export default Financeiro;
