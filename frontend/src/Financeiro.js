import React, { useState } from 'react';
import axios from 'axios';
import apiUrl from './config'; // Importe a variável apiUrl
import './Financeiro.css'; // Adicione o arquivo de estilo correspondente
import ExibirCaixa from './ExibirCaixa.js'

const abas = [
  { key: 'abrir', label: 'Abrir Caixa' },
  { key: 'fechar', label: 'Fechar Caixa' },
  { key: 'movimentar', label: 'Movimentar Caixa' },
  { key: 'exibir', label: 'Exibir Caixa' },
];

const Financeiro = () => {
  const [abaAtiva, setAbaAtiva] = useState('abrir');
  const [openCashForm, setOpenCashForm] = useState({ nome: '', fundo: '' });
  const [closeCashForm, setCloseCashForm] = useState({
    nome: '',
    valorCaixa: '',
    credito: '',
    debito: '',
    pix: '',
    outros: '',
  });
  const [movementForm, setMovementForm] = useState({ valor: '', justificativa: '' });
  const [message, setMessage] = useState(''); // Estado para mensagem do servidor

  const handleOpenCashChange = (e) => {
    const { name, value } = e.target;
    setOpenCashForm({ ...openCashForm, [name]: value });
  };

  const handleCloseCashChange = (e) => {
    const { name, value } = e.target;
    setCloseCashForm({ ...closeCashForm, [name]: value });
  };

  const handleMovementChange = (e) => {
    const { name, value } = e.target;
    setMovementForm({ ...movementForm, [name]: value });
  };

  const handleOpenCashSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${apiUrl}/caixa/abrir`, {
        nomeAbertura: openCashForm.nome,
        fundoCaixa: Number(openCashForm.fundo), // Certifique-se de que é um número
      });
      console.log('Caixa aberto:', response.data);
      setMessage('Caixa aberto com sucesso!'); // Mensagem de sucesso
      setOpenCashForm({ nome: '', fundo: '' }); // Limpa o formulário
    } catch (error) {
      console.error('Erro ao abrir caixa:', error);
      setMessage(error.response?.data?.message || 'Erro ao abrir caixa.'); // Mensagem de erro
    }
  };

  const handleCloseCashSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${apiUrl}/caixa/fechar`, {
        nomeFechamento: closeCashForm.nome,
        valorFechamento: Number(closeCashForm.valorCaixa), // Certifique-se de que é um número
        credito: Number(closeCashForm.credito) || 0, // Define 0 se não for fornecido
        debito: Number(closeCashForm.debito) || 0, // Define 0 se não for fornecido
        pix: Number(closeCashForm.pix) || 0, // Define 0 se não for fornecido
        outros: Number(closeCashForm.outros) || 0, // Define 0 se não for fornecido
      });
      console.log('Caixa fechado:', response.data);
      setMessage('Caixa fechado com sucesso!'); // Mensagem de sucesso
      setCloseCashForm({ nome: '', valorCaixa: '', credito: '', debito: '', pix: '', outros: '' }); // Limpa o formulário
    } catch (error) {
      console.error('Erro ao fechar caixa:', error);
      setMessage(error.response?.data?.message || 'Erro ao fechar caixa.'); // Mensagem de erro
    }
  };

  const handleMovementSubmit = async (e, type) => {
    e.preventDefault();
    try {
      const endpoint = type === 'add' ? '/caixa/adicionar' : '/caixa/remover';
      const response = await axios.post(`${apiUrl}${endpoint}`, {
        valor: Number(movementForm.valor),
        justificativa: movementForm.justificativa,
      });

      console.log(`${type === 'add' ? 'Adicionar' : 'Remover'} Movimento:`, response.data);
      setMessage(response.data.message); // Mensagem de sucesso
      // Limpa o formulário após a submissão
      setMovementForm({ valor: '', justificativa: '' });
    } catch (error) {
      console.error(`Erro ao ${type === 'add' ? 'adicionar' : 'remover'} movimentação:`, error);
      setMessage(error.response?.data?.message || `Erro ao ${type === 'add' ? 'adicionar' : 'remover'} movimentação.`); // Mensagem de erro
    }
  };

  return (
    <div className="fin-container">
      <h2 className="fin-title">Financeiro</h2>
      <div className="fin-abas">
        {abas.map((aba) => (
          <button
            key={aba.key}
            className={`fin-aba-btn${abaAtiva === aba.key ? ' fin-aba-ativa' : ''}`}
            onClick={() => setAbaAtiva(aba.key)}
            type="button"
          >
            {aba.label}
          </button>
        ))}
      </div>
      {message && <div className="fin-server-message">{message}</div>} {/* Exibir mensagem do servidor */}

      <div className="fin-conteudo-aba">
        {abaAtiva === 'abrir' && (
          <form className="fin-form" onSubmit={handleOpenCashSubmit} autoComplete="off">
            <h3 className="fin-form-title">Abrir Caixa</h3>
            <div className="fin-form-item">
              <label htmlFor="nome">Nome:</label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={openCashForm.nome}
                onChange={handleOpenCashChange}
                required
                className="fin-input"
              />
            </div>
            <div className="fin-form-item">
              <label htmlFor="fundo">Fundo de Caixa:</label>
              <input
                type="number"
                id="fundo"
                name="fundo"
                value={openCashForm.fundo}
                onChange={handleOpenCashChange}
                required
                className="fin-input"
              />
            </div>
            <button type="submit" className="fin-btn fin-btn-abrir">Abrir Caixa</button>
          </form>
        )}
        {abaAtiva === 'fechar' && (
          <form className="fin-form" onSubmit={handleCloseCashSubmit} autoComplete="off">
            <h3 className="fin-form-title">Fechar Caixa</h3>
            <div className="fin-form-item">
              <label htmlFor="nomeFechamento">Nome:</label>
              <input
                type="text"
                id="nomeFechamento"
                name="nome"
                value={closeCashForm.nome}
                onChange={handleCloseCashChange}
                required
                className="fin-input"
              />
            </div>
            <div className="fin-form-item">
              <label htmlFor="valorCaixa">Valor em Caixa:</label>
              <input
                type="number"
                id="valorCaixa"
                name="valorCaixa"
                value={closeCashForm.valorCaixa}
                onChange={handleCloseCashChange}
                required
                className="fin-input"
              />
            </div>
            <div className="fin-form-item">
              <label htmlFor="credito">Crédito:</label>
              <input
                type="number"
                id="credito"
                name="credito"
                value={closeCashForm.credito}
                onChange={handleCloseCashChange}
                className="fin-input"
              />
            </div>
            <div className="fin-form-item">
              <label htmlFor="debito">Débito:</label>
              <input
                type="number"
                id="debito"
                name="debito"
                value={closeCashForm.debito}
                onChange={handleCloseCashChange}
                className="fin-input"
              />
            </div>
            <div className="fin-form-item">
              <label htmlFor="pix">Pix:</label>
              <input
                type="number"
                id="pix"
                name="pix"
                value={closeCashForm.pix}
                onChange={handleCloseCashChange}
                className="fin-input"
              />
            </div>
            <div className="fin-form-item">
              <label htmlFor="outros">Outros:</label>
              <input
                type="number"
                id="outros"
                name="outros"
                value={closeCashForm.outros}
                onChange={handleCloseCashChange}
                className="fin-input"
              />
            </div>
            <button type="submit" className="fin-btn fin-btn-fechar">Fechar Caixa</button>
          </form>
        )}
        {abaAtiva === 'movimentar' && (
          <form className="fin-form" onSubmit={(e) => handleMovementSubmit(e, 'add')} autoComplete="off">
            <h3 className="fin-form-title">Movimentar Caixa</h3>
            <div className="fin-form-item">
              <label htmlFor="valorMovimentacao">Valor:</label>
              <input
                type="number"
                id="valorMovimentacao"
                name="valor"
                value={movementForm.valor}
                onChange={handleMovementChange}
                required
                className="fin-input"
              />
            </div>
            <div className="fin-form-item">
              <label htmlFor="justificativa">Justificativa:</label>
              <input
                type="text"
                id="justificativa"
                name="justificativa"
                value={movementForm.justificativa}
                onChange={handleMovementChange}
                required
                className="fin-input"
              />
            </div>
            <div className="fin-mov-btns">
              <button type="submit" className="fin-btn fin-btn-add">Adicionar</button>
              <button type="button" className="fin-btn fin-btn-remove" onClick={(e) => handleMovementSubmit(e, 'remove')}>
                Remover
              </button>
            </div>
          </form>
        )}
        {abaAtiva === 'exibir' && (
          <div className="fin-exibir-caixa">
            <ExibirCaixa />
          </div>
        )}
      </div>
    </div>
  );
};

export default Financeiro;
