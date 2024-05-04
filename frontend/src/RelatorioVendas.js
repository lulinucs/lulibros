import React, { useState } from 'react';
import './RelatorioVendas.css';
import apiUrl from './config'; // Importe a variável apiUrl

function RelatorioVendas() {
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [relatorio, setRelatorio] = useState(null);
  const [relatorioLivrosVendidos, setRelatorioLivrosVendidos] = useState(null);
  const [erro, setErro] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    try {
      let inicioDate = new Date(dataInicio);
      let fimDate = new Date(dataFim);

      inicioDate.setHours(inicioDate.getHours() + 3);
      fimDate.setHours(fimDate.getHours() + 27);
  
      const response = await fetch(apiUrl+'/relatorio-vendas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dataInicio: inicioDate,
          dataFim: fimDate,
        }),
      });
  
      if (!response.ok) {
        throw new Error('Erro ao gerar relatório de vendas');
      }
  
      const data = await response.json();
      setRelatorio(data);
      await handleRelatorioLivrosVendidos();
      setErro('');
    } catch (error) {
      setRelatorio(null);
      setErro(error.message);
    }
  };

  const handleRelatorioLivrosVendidos = async () => {
    try {
      const inicioDate = new Date(dataInicio);
      const fimDate = new Date(dataFim);

      inicioDate.setHours(inicioDate.getHours() + 3);
      fimDate.setHours(fimDate.getHours() + 27);
  
      const response = await fetch(apiUrl+'/relatorio-livros-vendidos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dataInicio: inicioDate,
          dataFim: fimDate,
        }),
      });
  
      if (!response.ok) {
        throw new Error('Erro ao gerar relatório de livros vendidos');
      }
  
      const data = await response.json();
  
      const uniqueLivrosVendidos = [];
      data.forEach(livro => {
        const existingBookIndex = uniqueLivrosVendidos.findIndex(
          item => item.ISBN === livro.ISBN && item['Valor Vendido'] === livro['Valor Vendido']
        );
        if (existingBookIndex !== -1) {
          uniqueLivrosVendidos[existingBookIndex].Quantidade += livro.Quantidade;
        } else {
          uniqueLivrosVendidos.push(livro);
        }
      });
  
      setRelatorioLivrosVendidos(uniqueLivrosVendidos);
      setErro('');
    } catch (error) {
      setRelatorioLivrosVendidos([]);
      setErro(error.message);
    }
  };

  const handleDownload = async () => {
    try {
      let inicioDate = new Date(dataInicio);
      let fimDate = new Date(dataFim);

      inicioDate.setHours(inicioDate.getHours() + 3);
      fimDate.setHours(fimDate.getHours() + 27);

      const response = await fetch(apiUrl+'/relatorio-livros-vendidos-xlsx', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dataInicio: inicioDate,
          dataFim: fimDate,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao baixar o relatório');
      }

      // Transformar a resposta em um blob
      const blob = await response.blob();

      // Criar um link temporário para fazer o download do arquivo
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `relatorio_livros_vendidos_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error('Erro ao baixar o relatório:', error);
      setErro('Erro ao baixar o relatório');
    }
  };

  return (
    <div className="relatorio-container">
      <h2>Gerar Relatório de Vendas</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="dataInicio">Data de Início:</label>
          <input
            type="date"
            id="dataInicio"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="dataFim">Data de Fim:</label>
          <input
            type="date"
            id="dataFim"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            required
          />
        </div>
        <button type="submit" onClick={handleSubmit}>Gerar Relatório</button>
        <button onClick={handleDownload}>Baixar Relatório</button>
      </form>
  
      {relatorioLivrosVendidos && (
        <div className="tabela-livros-vendidos">
          <h3>Tabela de Livros Vendidos</h3>
          <table>
            <thead>
              <tr>
                <th>ISBN</th>
                <th>Título</th>
                <th>Editora</th>
                <th>Valor Vendido</th>
                <th>Quantidade</th>
              </tr>
            </thead>
            <tbody>
              {relatorioLivrosVendidos.map(livro => (
                <tr key={livro.ISBN}>
                  <td>{livro.ISBN}</td>
                  <td>{livro.Título}</td>
                  <td>{livro.Editora}</td>
                  <td>R${livro['Valor Vendido'].toFixed(2)}</td>
                  <td>{livro.Quantidade}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
  
      {relatorio && (
        <div className="relatorio">
          <p>Total de Vendas: {relatorio.totalVendas}</p>
          <p>Total de Produtos Vendidos: {relatorio.totalProdutosVendidos}</p>
          <p>Valor Total de Vendas: R${relatorio.valorTotalVendas.toFixed(2)}</p>
          <p>Ticket Médio: R${relatorio.ticketMedio.toFixed(2)}</p>
          {/* Adicione outras informações desejadas aqui */}
        </div>
      )}
  
      {erro && <p className="erro">{erro}</p>}
    </div>
  );
}

export default RelatorioVendas;
