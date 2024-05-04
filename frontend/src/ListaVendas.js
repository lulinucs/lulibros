import React, { useState, useEffect } from 'react';
import axios from 'axios';
import apiUrl from './config'; // Importe a variável apiUrl
import './ListaVendas.css'; 

const ListaVendas = () => {
  const [vendas, setVendas] = useState([]);
  const [vendaSelecionada, setVendaSelecionada] = useState(null); 
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [dataSelecionada, setDataSelecionada] = useState('');
  const [novoCliente, setNovoCliente] = useState({
    nome: '',
    cpf: '',
    email: '',
    telefone: '',
    cep: '',
    endereco: '',
    bairro: '',
    cidade: '',
    estado: ''
  });

  const fetchVendas = async (data = '') => {
    try {
      const response = await axios.get(`${apiUrl}/vendas${data ? `?data=${data}` : ''}`);
      setVendas(response.data);
    } catch (error) {
      console.error('Erro ao carregar as vendas:', error);
    }
  };

  useEffect(() => {
    fetchVendas(dataSelecionada);
  }, [dataSelecionada]);

  const handleDataSelecionadaChange = (event) => {
    setDataSelecionada(event.target.value);
  };
  
  const formatarTimestamp = (timestamp) => {
    const data = new Date(timestamp);
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const hora = String(data.getHours()).padStart(2, '0');
    const minuto = String(data.getMinutes()).padStart(2, '0');
    const segundo = String(data.getSeconds()).padStart(2, '0');
    return `${dia}/${mes} | ${hora}:${minuto}:${segundo}`;
  };

  const abrirModal = async (id) => {
    try {
      const response = await axios.get(`${apiUrl}/vendas/${id}`);
      setVendaSelecionada(response.data);
    } catch (error) {
      console.error('Erro ao carregar a venda:', error);
    }
  };

  const fecharModal = () => {
    setVendaSelecionada(null);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNovoCliente({ ...novoCliente, [name]: value });
  };

  const adicionarNovoCliente = async () => {
    try {
      const response = await axios.post(`${apiUrl}/salvarCliente`, novoCliente); // Corrigido aqui
      const clienteAdicionado = response.data.cliente;
      
      // Associar o novo cliente à venda selecionada
      if (vendaSelecionada) {
        const idCliente = clienteAdicionado._id;
        const idVenda = vendaSelecionada._id;
        await axios.put(`${apiUrl}/vendas/${idCliente}/${idVenda}`);
        
        // Atualizar a venda selecionada com os dados do cliente recém-adicionado
        setVendaSelecionada(prevVendaSelecionada => ({
          ...prevVendaSelecionada,
          cliente: clienteAdicionado
        }));
      }
      
      // Limpar os campos após adicionar o cliente
      setNovoCliente({ 
        nome: '',
        cpf: '',
        email: '',
        telefone: '',
        cep: '',
        endereco: '',
        bairro: '',
        cidade: '',
        estado: ''
      });
      
      // Recarregar as vendas para refletir a atualização
      fetchVendas();
    } catch (error) {
      console.error('Erro ao adicionar o cliente:', error);
    }
  };

  const fecharFormulario = () => {
    setMostrarFormulario(false);
  };

  const estornarVenda = async () => {
    if (window.confirm("Tem certeza de que deseja estornar esta venda?")) {
      try {
        await axios.post(`${apiUrl}/estornar-venda/${vendaSelecionada._id}`);
        // Atualizar a lista de vendas após o estorno
        fetchVendas();
        // Fechar o modal
        fecharModal();
      } catch (error) {
        console.error('Erro ao estornar a venda:', error);
      }
    }
  };

  return (
    <div className="ListaVendas">
      <h2>Lista de Vendas</h2>
      <div className='data-seletor'>
        <label htmlFor="dataSelecionada">Filtrar por data:</label>
        <input
          type="date"
          id="dataSelecionada"
          value={dataSelecionada}
          onChange={handleDataSelecionadaChange}
        />
      </div>

      <div className="vendas-container">
        {vendas
          .filter((venda) => {
            // Se dataSelecionada não estiver vazio, filtre as vendas pela data
            if (dataSelecionada) {
              const dataVenda = new Date(venda.timestamp).toISOString().slice(0, 10); // Converta o timestamp da venda para uma string de data
              return dataVenda === dataSelecionada;
            }
            // Se dataSelecionada estiver vazio, exiba todas as vendas
            return true;
          })
          .map((venda) => (
            <div key={venda._id} className="venda-card" onClick={() => abrirModal(venda._id)}>
              <div className="card-content">
                <p className="timestamp">{formatarTimestamp(venda.timestamp)}</p>
                <p className="valor-final">R$ {venda.total.toFixed(2)}</p>
              </div>
            </div>
          ))}
      </div>

      {/* Modal */}
      {vendaSelecionada && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={fecharModal}>&times;</span>
            <h2>Detalhes da Venda</h2>
            <p className="date">{formatarTimestamp(vendaSelecionada.timestamp)}</p>

            <h3>Livros</h3>
            {vendaSelecionada.livros.map((livro) => (
              <div key={livro._id} className="livro-card">
                <div className="quantidade"> {livro.quantidade}x</div>
              <div className="isbn">{livro.livro.ISBN}</div>
              <div className="titulo">{livro.livro.Título}</div>
              <div className="valor">R$ {livro.livro.Valor.toFixed(2)}</div>
      
            </div>
            ))}
           <div className="total-container">
            <p className="total-label">Total</p>
            <p className="valor-total-modal">R$ {vendaSelecionada.total.toFixed(2)}</p>
          </div>
           <div className="card">
              {vendaSelecionada.cliente && (
                <div className="info-column">
                  {vendaSelecionada.cliente.nome && <p>Nome: {vendaSelecionada.cliente.nome}</p>}
                  {vendaSelecionada.cliente.cpf && <p>CPF: {vendaSelecionada.cliente.cpf}</p>}
                  {vendaSelecionada.cliente.email && <p>Email: {vendaSelecionada.cliente.email}</p>}
                  {vendaSelecionada.cliente.telefone && <p>Telefone: {vendaSelecionada.cliente.telefone}</p>}
                </div>
              )}
              {vendaSelecionada.cliente && (
                <div className="info-column">
                  {vendaSelecionada.cliente.cep && <p>CEP: {vendaSelecionada.cliente.cep}</p>}
                  {vendaSelecionada.cliente.endereco && <p>Endereço: {vendaSelecionada.cliente.endereco}</p>}
                  {vendaSelecionada.cliente.bairro && <p>Bairro: {vendaSelecionada.cliente.bairro}</p>}
                  {vendaSelecionada.cliente.cidade && <p>Cidade: {vendaSelecionada.cliente.cidade}</p>}
                  {vendaSelecionada.cliente.estado && <p>Estado: {vendaSelecionada.cliente.estado}</p>}
                </div>
              )}
              {!vendaSelecionada.cliente && (
                <div className="info-column">
                  {mostrarFormulario && (
                    <div className="input-group">
                      <h3>Novo Cliente</h3>
                      <input type="text" name="nome" value={novoCliente.nome} onChange={handleInputChange} placeholder="Nome" />
                      <input type="text" name="cpf" value={novoCliente.cpf} onChange={handleInputChange} placeholder="CPF" />
                      <input type="email" name="email" value={novoCliente.email} onChange={handleInputChange} placeholder="Email" />
                      <input type="text" name="telefone" value={novoCliente.telefone} onChange={handleInputChange} placeholder="Telefone" />
                      <input type="text" name="cep" value={novoCliente.cep} onChange={handleInputChange} placeholder="CEP" />
                      <input type="text" name="endereco" value={novoCliente.endereco} onChange={handleInputChange} placeholder="Endereço" />
                      <input type="text" name="bairro" value={novoCliente.bairro} onChange={handleInputChange} placeholder="Bairro" />
                      <input type="text" name="cidade" value={novoCliente.cidade} onChange={handleInputChange} placeholder="Cidade" />
                      <input type="text" name="estado" value={novoCliente.estado} onChange={handleInputChange} placeholder="Estado" />
                      <br />
                      <button className="adicionar-cliente-button" onClick={adicionarNovoCliente}>Salvar</button>
                      <button className="fechar-button" onClick={() => setMostrarFormulario(!mostrarFormulario)}>
                        {mostrarFormulario ? "Fechar" : "Fechar"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <button className="estornar-button" onClick={estornarVenda}>Estornar Venda</button>
            {!vendaSelecionada.cliente && <button className="adicionar-cliente-button" onClick={() => setMostrarFormulario(true)}>Adicionar Cliente</button>}
            <button className="fechar-button" onClick={fecharModal}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListaVendas;

