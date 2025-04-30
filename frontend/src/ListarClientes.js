import React, { useState, useEffect } from 'react';
import axios from 'axios';
import apiUrl from './config'; // Importe a variável apiUrl
import './ListarClientes.css';

const ListarClientes = () => {
  const [clientes, setClientes] = useState([]);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [clienteEditado, setClienteEditado] = useState({
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
  const [buscaNome, setBuscaNome] = useState('');
  const [modoEdicao, setModoEdicao] = useState(false);

  useEffect(() => {
    const fetchClientes = async () => {
      console.log('BuscaNome:', buscaNome); // Adicione este console.log
      try {
        const response = await axios.get(`${apiUrl}/clientes?nome=${buscaNome}`);
        console.log('Response:', response.data); // Adicione este console.log
        setClientes(response.data);
      } catch (error) {
        console.error('Erro ao carregar os clientes:', error);
      }
    };

    fetchClientes();
  }, [buscaNome]);

  const handleEditarCliente = (cliente) => {
    setClienteSelecionado(cliente);
    setClienteEditado(cliente);
    setModoEdicao(false);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setClienteEditado({ ...clienteEditado, [name]: value });
  };

  const handleSalvarEdicao = async () => {
    try {
      await axios.put(`${apiUrl}/editarcliente/${clienteSelecionado._id}`, clienteEditado);
      // Atualizar a lista de clientes após a edição
      const response = await axios.get(`${apiUrl}/clientes`);
      setClientes(response.data);
      // Fechar o modal de edição
      setClienteSelecionado(null);
    } catch (error) {
      console.error('Erro ao editar o cliente:', error);
    }
  };

  const handleCancelarEdicao = () => {
    setClienteSelecionado(null);
    setClienteEditado({
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
  };

  return (
    <div className="lc-container">
      <h2 className="lc-title">Clientes</h2>
      <div className="lc-busca-container">
        <input
          type="text"
          placeholder="Buscar por nome"
          value={buscaNome}
          onChange={(e) => setBuscaNome(e.target.value)}
          className="lc-input"
        />
      </div>
      <div className="lc-clientes-lista">
        {clientes
          .filter(cliente => cliente.nome && cliente.nome.toLowerCase().includes(buscaNome.toLowerCase()))
          .map((cliente) => (
            <div key={cliente._id} className="lc-card" onClick={() => handleEditarCliente(cliente)}>
              <div className="lc-avatar">
                {cliente.nome ? cliente.nome.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() : '?'}
              </div>
              <div className="lc-card-info">
                <div className="lc-card-nome">{cliente.nome}</div>
                <div className="lc-card-email">{cliente.email}</div>
              </div>
            </div>
          ))}
      </div>

      {/* Modal de Exibição/Edição */}
      {clienteSelecionado && (
        <div className="lc-modal-bg">
          <div className="lc-modal">
            <span className="lc-modal-close" onClick={() => setClienteSelecionado(null)}>&times;</span>
            <h2 className="lc-modal-title">{modoEdicao ? 'Editar Cliente' : 'Dados do Cliente'}</h2>
            {modoEdicao ? (
              <>
                <input type="text" name="nome" value={clienteEditado.nome} onChange={handleInputChange} placeholder="Nome" className="lc-input" />
                <input type="text" name="cpf" value={clienteEditado.cpf} onChange={handleInputChange} placeholder="CPF" className="lc-input" />
                <input type="text" name="email" value={clienteEditado.email} onChange={handleInputChange} placeholder="Email" className="lc-input" />
                <input type="text" name="telefone" value={clienteEditado.telefone} onChange={handleInputChange} placeholder="Telefone" className="lc-input" />
                <input type="text" name="cep" value={clienteEditado.cep} onChange={handleInputChange} placeholder="CEP" className="lc-input" />
                <input type="text" name="endereco" value={clienteEditado.endereco} onChange={handleInputChange} placeholder="Endereço" className="lc-input" />
                <input type="text" name="bairro" value={clienteEditado.bairro} onChange={handleInputChange} placeholder="Bairro" className="lc-input" />
                <input type="text" name="cidade" value={clienteEditado.cidade} onChange={handleInputChange} placeholder="Cidade" className="lc-input" />
                <input type="text" name="estado" value={clienteEditado.estado} onChange={handleInputChange} placeholder="Estado" className="lc-input" />
                <div className="lc-modal-botoes">
                  <button className='lc-btn lc-btn-salvar' onClick={handleSalvarEdicao}>Salvar</button>
                  <button className='lc-btn lc-btn-cancelar' onClick={() => { setModoEdicao(false); setClienteEditado(clienteSelecionado); }}>Cancelar</button>
                </div>
              </>
            ) : (
              <div className="lc-modal-view">
                <div className="lc-modal-view-row"><span>Nome:</span> <span>{clienteSelecionado.nome}</span></div>
                <div className="lc-modal-view-row"><span>CPF:</span> <span>{clienteSelecionado.cpf}</span></div>
                <div className="lc-modal-view-row"><span>Email:</span> <span className="lc-modal-view-email">{clienteSelecionado.email}</span></div>
                <div className="lc-modal-view-row"><span>Telefone:</span> <span>{clienteSelecionado.telefone}</span></div>
                <div className="lc-modal-view-row"><span>CEP:</span> <span>{clienteSelecionado.cep}</span></div>
                <div className="lc-modal-view-row"><span>Endereço:</span> <span>{clienteSelecionado.endereco}</span></div>
                <div className="lc-modal-view-row"><span>Bairro:</span> <span>{clienteSelecionado.bairro}</span></div>
                <div className="lc-modal-view-row"><span>Cidade:</span> <span>{clienteSelecionado.cidade}</span></div>
                <div className="lc-modal-view-row"><span>Estado:</span> <span>{clienteSelecionado.estado}</span></div>
                <div className="lc-modal-botoes">
                  <button className='lc-btn lc-btn-salvar' onClick={() => setModoEdicao(true)}>Editar</button>
                  <button className='lc-btn lc-btn-cancelar' onClick={() => setClienteSelecionado(null)}>Fechar</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ListarClientes;
