import React, { useState } from 'react';
import './RelatorioVendas.css';
import apiUrl from './config'; // Importe a variável apiUrl
import { FaCalendarAlt, FaDownload, FaChartBar, FaBook } from 'react-icons/fa';
import { DateRange } from 'react-date-range';
import format from 'date-fns/format';
import addYears from 'date-fns/addYears';
import { ptBR } from 'date-fns/locale';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

function RelatorioVendas() {
  const [dateRange, setDateRange] = useState([
    {
      startDate: addYears(new Date(), -1), // Data inicial: 1 ano atrás
      endDate: new Date(), // Data final: hoje
      key: 'selection'
    }
  ]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [relatorio, setRelatorio] = useState(null);
  const [relatorioLivrosVendidos, setRelatorioLivrosVendidos] = useState(null);
  const [erro, setErro] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setErro('');
    
    try {
      let inicioDate = new Date(dateRange[0].startDate);
      let fimDate = new Date(dateRange[0].endDate);

      inicioDate.setHours(inicioDate.getHours() + 3);
      fimDate.setHours(fimDate.getHours() + 27);
  
      const response = await fetch(apiUrl+'/relatorio-vendas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dataInicio: inicioDate.toISOString(),
          dataFim: fimDate.toISOString(),
        }),
      });
  
      if (!response.ok) {
        throw new Error('Erro ao gerar relatório de vendas');
      }
  
      const data = await response.json();
      setRelatorio(data);
      await handleRelatorioLivrosVendidos();
    } catch (error) {
      setRelatorio(null);
      setErro(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRelatorioLivrosVendidos = async () => {
    try {
      const inicioDate = new Date(dateRange[0].startDate);
      const fimDate = new Date(dateRange[0].endDate);

      inicioDate.setHours(inicioDate.getHours() + 3);
      fimDate.setHours(fimDate.getHours() + 27);
  
      const response = await fetch(apiUrl+'/relatorio-livros-vendidos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dataInicio: inicioDate.toISOString(),
          dataFim: fimDate.toISOString(),
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
      let inicioDate = new Date(dateRange[0].startDate);
      let fimDate = new Date(dateRange[0].endDate);

      inicioDate.setHours(inicioDate.getHours() + 3);
      fimDate.setHours(fimDate.getHours() + 27);

      const response = await fetch(apiUrl+'/relatorio-livros-vendidos-xlsx', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dataInicio: inicioDate.toISOString(),
          dataFim: fimDate.toISOString(),
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

  const calculateTotal = () => {
    let totalVendas = 0;
    let totalProdutosVendidos = 0;
    let valorTotalVendas = 0;

    if (relatorio) {
      relatorio.forEach(item => {
        totalVendas += item.totalVendas;
        totalProdutosVendidos += item.totalProdutosVendidos;
        valorTotalVendas += item.valorTotalVendas;
      });
    }

    return {
      totalVendas,
      totalProdutosVendidos,
      valorTotalVendas,
    };
  };

  const totals = calculateTotal();

  return (
    <div className="relatorio-container">
      <h2>Relatório de Vendas</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>
            <FaCalendarAlt /> Período do Relatório
          </label>
          <div className="date-range-wrapper">
            <div 
              className="date-range-input"
              onClick={() => setShowDatePicker(!showDatePicker)}
            >
              <FaCalendarAlt />
              {format(dateRange[0].startDate, 'dd/MM/yyyy', { locale: ptBR })} - {format(dateRange[0].endDate, 'dd/MM/yyyy', { locale: ptBR })}
            </div>
            {showDatePicker && (
              <div className="date-range-picker-container">
                <DateRange
                  onChange={item => {
                    const { startDate, endDate } = item.selection;
                    setDateRange([{
                      startDate,
                      endDate: endDate || startDate, // Garante que sempre tem endDate
                      key: 'selection'
                    }]);
                  }}
                  moveRangeOnFirstSelection={false}
                  months={1}
                  ranges={dateRange}
                  direction="horizontal"
                  locale={ptBR}
                  showDateDisplay={false}
                  showMonthAndYearPickers={true}
                  showMonthArrow={true}
                  showPreview={true}
                  rangeColors={['#2563eb']}
                  minDate={new Date(2020, 0, 1)}
                  maxDate={new Date()}
                />
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
          <button type="submit" className="rel-btn" disabled={isLoading}>
            <FaChartBar /> {isLoading ? 'Gerando...' : 'Gerar Relatório'}
          </button>
          <button type="button" className="rel-btn" onClick={handleDownload}>
            <FaDownload /> Baixar Relatório
          </button>
        </div>
      </form>
  
      {relatorioLivrosVendidos && (
        <div className="tabela-livros-vendidos">
          <h3><FaBook /> Livros Vendidos</h3>
          <div style={{ overflowX: 'auto' }}>
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
        </div>
      )}
  
      {relatorio && (
        <div className="relatorio">
          <h3><FaChartBar /> Resumo por Forma de Pagamento</h3>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Forma de Pagamento</th>
                  <th>Total de Vendas</th>
                  <th>Total de Produtos</th>
                  <th>Valor Total</th>
                </tr>
              </thead>
              <tbody>
                {relatorio.map((item, index) => (
                  <tr key={index}>
                    <td>{item._id || 'Não especificado'}</td>
                    <td>{item.totalVendas}</td>
                    <td>{item.totalProdutosVendidos}</td>
                    <td>R${item.valorTotalVendas.toFixed(2)}</td>
                  </tr>
                ))}
                <tr>
                  <td><strong>Total Geral</strong></td>
                  <td><strong>{totals.totalVendas}</strong></td>
                  <td><strong>{totals.totalProdutosVendidos}</strong></td>
                  <td><strong>R${totals.valorTotalVendas.toFixed(2)}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
  
      {erro && <p className="erro">{erro}</p>}
    </div>
  );
}

export default RelatorioVendas;
