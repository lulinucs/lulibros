import React, { useState, useEffect } from 'react';
import axios from 'axios';
import apiUrl from './config'; // Importe a variável apiUrl
import './ListaVendas.css'; 
import { FaUserPlus, FaTrashAlt, FaSearch, FaCalendarAlt, FaTimes, FaUndo, FaUserEdit, FaSpinner, FaBook, FaRegClock } from 'react-icons/fa';

const ListaVendas = () => {
  const [vendas, setVendas] = useState([]);
  const [vendaSelecionada, setVendaSelecionada] = useState(null); 
  const [showClienteModal, setShowClienteModal] = useState(false);
  const [dataSelecionada, setDataSelecionada] = useState(new Date().toISOString().split('T')[0]);
  const [loadingCpf, setLoadingCpf] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [clienteEncontrado, setClienteEncontrado] = useState(false);
  const [novoCliente, setNovoCliente] = useState({
    nome: '',
    cpf: '',
    email: '',
    telefone: '',
    cep: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: ''
  });
  const [imageLoadErrors, setImageLoadErrors] = useState({});

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

    if (name === 'cpf' && value.length === 11) {
      buscarClientePorCpf(value);
    }

    if (name === 'cep' && value.length === 8) {
      buscarEnderecoPorCep(value);
    }
  };

  const handleAbrirClienteModal = () => {
    setNovoCliente({
      nome: '',
      cpf: '',
      email: '',
      telefone: '',
      cep: '',
      endereco: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: ''
    });
    setClienteEncontrado(false);
    setShowClienteModal(true);
  };

  const handleFecharClienteModal = () => {
    setShowClienteModal(false);
      setNovoCliente({ 
        nome: '',
        cpf: '',
        email: '',
        telefone: '',
        cep: '',
        endereco: '',
      numero: '',
      complemento: '',
        bairro: '',
        cidade: '',
        estado: ''
      });
  };

  const handleSalvarNovoCliente = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post(`${apiUrl}/salvarcliente`, novoCliente);
      const clienteSalvo = response.data.cliente;
      
      if (vendaSelecionada) {
        await axios.put(`${apiUrl}/vendas/${clienteSalvo._id}/${vendaSelecionada._id}`);
        setVendaSelecionada(prev => ({
          ...prev,
          cliente: clienteSalvo
        }));
      }
      
      setShowClienteModal(false);
      fetchVendas();
    } catch (error) {
      console.error('Erro ao salvar o cliente:', error);
    }
  };

  // Busca cliente por CPF ao digitar 11 dígitos
  const buscarClientePorCpf = async (cpf) => {
    setLoadingCpf(true);
    try {
      const response = await axios.get(`${apiUrl}/cliente/${cpf}`);
      if (response.data) {
        const clienteEncontrado = response.data;
        setNovoCliente({
          nome: clienteEncontrado.nome || '',
          cpf: clienteEncontrado.cpf || '',
          email: clienteEncontrado.email || '',
          telefone: clienteEncontrado.telefone || '',
          cep: clienteEncontrado.cep || '',
          endereco: clienteEncontrado.endereco || '',
          numero: clienteEncontrado.numero || '',
          complemento: clienteEncontrado.complemento || '',
          bairro: clienteEncontrado.bairro || '',
          cidade: clienteEncontrado.cidade || '',
          estado: clienteEncontrado.estado || ''
        });
        setClienteEncontrado(true);
      } else {
        setClienteEncontrado(false);
      }
    } catch (error) {
      setClienteEncontrado(false);
    } finally {
      setLoadingCpf(false);
    }
  };

  // Busca endereço pelo CEP ao digitar 8 dígitos
  const buscarEnderecoPorCep = async (cep) => {
    setLoadingCep(true);
    try {
      const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
      if (!response.data.erro) {
        setNovoCliente(prev => ({
          ...prev,
          endereco: response.data.logradouro || '',
          bairro: response.data.bairro || '',
          cidade: response.data.localidade || '',
          estado: response.data.uf || ''
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    } finally {
      setLoadingCep(false);
    }
  };

  const estornarVenda = async () => {
    if (window.confirm("Tem certeza de que deseja estornar esta venda?")) {
      try {
        await axios.post(`${apiUrl}/estornar-venda/${vendaSelecionada._id}`);
        fetchVendas();
        fecharModal();
      } catch (error) {
        console.error('Erro ao estornar a venda:', error);
      }
    }
  };

  // Função utilitária para cor das badges
  const badgeColor = (tipo, valor) => {
    if (tipo === 'tipoVenda') {
      return valor === 'saldo' ? 'badge-saldo' : 'badge-novo';
    }
    if (tipo === 'formaPagamento') {
      switch (valor) {
        case 'Pix': return 'badge-pix';
        case 'Crédito': return 'badge-credito';
        case 'Débito': return 'badge-debito';
        case 'Dinheiro': return 'badge-dinheiro';
        case 'ZigPay': return 'badge-zigpay';
        default: return 'badge-outro';
      }
    }
    return '';
  };

  // Função para fallback de imagem
  const handleImageError = (isbn) => {
    setImageLoadErrors(prev => ({ ...prev, [isbn]: true }));
  };

  return (
    <div className="lv-ListaVendas">
      <div className="header">
        <h2>Lista de Vendas</h2>
        <div className="data-seletor">
          <FaCalendarAlt />
          <input
            type="date"
            id="dataSelecionada"
            value={dataSelecionada}
            onChange={handleDataSelecionadaChange}
          />
        </div>
      </div>

      <div className="lv-lista-vendas">
        <div className="lv-lista-vendas-header">
          <span className="lv-lista-vendas-th">Data/Hora</span>
          <span className="lv-lista-vendas-th">Total</span>
          <span className="lv-lista-vendas-th">Pagamento</span>
          <span className="lv-lista-vendas-th">Tipo</span>
        </div>
        {vendas
          .filter((venda) => {
            if (dataSelecionada) {
              const dataVenda = new Date(venda.timestamp).toISOString().slice(0, 10);
              return dataVenda === dataSelecionada;
            }
            return true;
          })
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .map((venda) => (
            <div key={venda._id} className="lv-lista-vendas-row" onClick={() => abrirModal(venda._id)}>
              <span className="lv-lista-vendas-td">
                <span className="lv-data-badge">
                  <FaRegClock style={{marginRight: 6, opacity: 0.7}} />
                  {formatarTimestamp(venda.timestamp)}
                </span>
              </span>
              <span className="lv-lista-vendas-td">
                <span className="lv-valor-total-badge lv-compact">R$ {venda.total.toFixed(2)}</span>
              </span>
              <span className="lv-lista-vendas-td">
                <span className={`badge ${badgeColor('formaPagamento', venda.formaPagamento)}`}>{venda.formaPagamento}</span>
              </span>
              <span className="lv-lista-vendas-td">
                <span className={`badge ${badgeColor('tipoVenda', venda.tipoVenda)}`}>{venda.tipoVenda === 'saldo' ? 'Saldo' : 'Novo'}</span>
              </span>
            </div>
          ))}
      </div>

      {showClienteModal && (
        <div className="modal cliente-modal">
          <div className="modal-content">
            <FaTimes className="close" onClick={handleFecharClienteModal} />
            <h3>{vendaSelecionada?.cliente ? 'Alterar Cliente' : 'Adicionar Cliente'}</h3>
            
            <form className="lv-form" onSubmit={handleSalvarNovoCliente}>
              <input type="text" name="nome" value={novoCliente.nome} onChange={handleInputChange} placeholder="Nome" required className="lv-input" />
              <div style={{ position: 'relative' }}>
                <input type="text" name="cpf" value={novoCliente.cpf} onChange={handleInputChange} placeholder="CPF" className="lv-input" />
                {loadingCpf && <FaSpinner className="spinner" />}
              </div>
              <input type="email" name="email" value={novoCliente.email} onChange={handleInputChange} placeholder="Email" className="lv-input" />
              <input type="text" name="telefone" value={novoCliente.telefone} onChange={handleInputChange} placeholder="Telefone" className="lv-input" />
              <div style={{ position: 'relative' }}>
                <input type="text" name="cep" value={novoCliente.cep} onChange={handleInputChange} placeholder="CEP" className="lv-input" />
                {loadingCep && <FaSpinner className="spinner" />}
              </div>
              <input type="text" name="endereco" value={novoCliente.endereco} onChange={handleInputChange} placeholder="Endereço" className="lv-input" />
              <input type="text" name="numero" value={novoCliente.numero} onChange={handleInputChange} placeholder="Número" className="lv-input" />
              <input type="text" name="complemento" value={novoCliente.complemento} onChange={handleInputChange} placeholder="Complemento" className="lv-input" />
              <input type="text" name="bairro" value={novoCliente.bairro} onChange={handleInputChange} placeholder="Bairro" className="lv-input" />
              <input type="text" name="cidade" value={novoCliente.cidade} onChange={handleInputChange} placeholder="Cidade" className="lv-input" />
              <input type="text" name="estado" value={novoCliente.estado} onChange={handleInputChange} placeholder="Estado" className="lv-input" />
              <div className="botoes-cliente">
                <button type="submit" className="btn-registrar-venda">
                  {clienteEncontrado ? 'Vincular Cliente' : 'Cadastrar Cliente'}
                </button>
                <button type="button" className="btn-cancelar-cliente" onClick={handleFecharClienteModal}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {vendaSelecionada && (
        <div className="modal">
          <div className="modal-content">
            <FaTimes className="close" onClick={fecharModal} />
            <h2>Detalhes da Venda</h2>
            <div className="venda-header">
              <span className="lv-data-badge-modal">
                <FaRegClock style={{marginRight: 6, opacity: 0.7}} />
                {formatarTimestamp(vendaSelecionada.timestamp)}
              </span>
              <div className="venda-info-header">
                <span className={`badge ${badgeColor('formaPagamento', vendaSelecionada.formaPagamento)}`}>
                  {vendaSelecionada.formaPagamento}
                </span>
                <span className={`badge ${badgeColor('tipoVenda', vendaSelecionada.tipoVenda)}`}>
                  {vendaSelecionada.tipoVenda === 'saldo' ? 'Saldo' : 'Novo'}
                </span>
              </div>
            </div>

            <div className="lv-livros-scroll-modal">
              {vendaSelecionada.livros.map((livro) => (
                <div key={livro._id} className="lv-livro-card-horizontal">
                  <div className="lv-livro-capa-area">
                    {!imageLoadErrors[livro.livro.ISBN] ? (
                      <img
                        src={`${apiUrl}/imagem/${livro.livro.ISBN}.jpg`}
                        alt={livro.livro.Título}
                        className="lv-livro-capa-img"
                        onError={() => handleImageError(livro.livro.ISBN)}
                      />
                    ) : (
                      <FaBook className="lv-livro-capa-fallback" />
                    )}
                  </div>
                  <div className="lv-livro-info-area">
                    <div className="lv-livro-titulo">{livro.livro.Título}</div>
                    <div className="lv-livro-meta">
                      <span className="lv-livro-autor">{livro.livro.Autor}</span>
                      <span className="lv-livro-editora">{livro.livro.Editora}</span>
                    </div>
                    <div className="lv-livro-isbn">ISBN: {livro.livro.ISBN}</div>
                  </div>
                  <div className="lv-livro-qtd-valor-area">
                    <div className="lv-livro-qtd">{livro.quantidade}x</div>
                    <div className="lv-livro-valor">R$ {livro.subtotal.toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="lv-total-container-elegante lv-compact">
              <span className="lv-total-label">Total</span>
              <span className="lv-valor-total-badge lv-compact">R$ {vendaSelecionada.total.toFixed(2)}</span>
            </div>

            {vendaSelecionada.cliente && (
              <div className="cliente-info">
                <div className="lv-cliente-vinculado lv-ultra-minimal lv-cliente-simples">
                  <span className="lv-cliente-nome">{vendaSelecionada.cliente.nome}</span>
                  <span className="lv-cliente-info-mini">{vendaSelecionada.cliente.email} &bull; {vendaSelecionada.cliente.telefone}</span>
                  <span className="lv-cliente-info-mini">CPF: {vendaSelecionada.cliente.cpf}</span>
                  <span className="lv-cliente-info-mini">Endereço: {vendaSelecionada.cliente.endereco}, {vendaSelecionada.cliente.bairro}</span>
                  <span className="lv-cliente-info-mini">Cidade/UF: {vendaSelecionada.cliente.cidade}/{vendaSelecionada.cliente.estado}</span>
                </div>
              </div>
            )}

            <div className="lv-botoes-acoes">
              {vendaSelecionada.cliente ? (
                <button className="lv-btn-alterar-cliente lv-btn-alterar-cliente-verde" onClick={handleAbrirClienteModal}>
                  <FaUserEdit /> Alterar Cliente
                </button>
              ) : (
                <button className="lv-btn-add-cliente lv-btn-add-cliente-verde" onClick={handleAbrirClienteModal}>
                  <FaUserPlus /> Adicionar Cliente
                </button>
              )}
              <button className="lv-btn-estornar lv-btn-estornar-amarelo" onClick={estornarVenda}>
                <FaUndo /> Estornar Venda
              </button>
              <button className="lv-btn-fechar lv-btn-fechar-vermelho" onClick={fecharModal}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListaVendas;