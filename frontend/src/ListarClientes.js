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
    <div className="listar-clientes-container">
      <h2 className="listar-clientes-title">Lista de Clientes</h2>
      <div className="busca-container">
        <input
          type="text"
          placeholder="Buscar por nome"
          value={buscaNome}
          onChange={(e) => setBuscaNome(e.target.value)}
        />
      </div>
      <div className="clientes-container">
      {clientes
            .filter(cliente => cliente.nome && cliente.nome.toLowerCase().includes(buscaNome.toLowerCase()))
            .map((cliente) => (
                <div key={cliente._id} className="cliente-card" onClick={() => handleEditarCliente(cliente)}>
                <p className="cliente-nome">{cliente.nome}</p>
                <p className="cliente-nome">{cliente.email}</p>
                </div>
            ))}
      </div>

      {/* Modal de Edição */}
      {clienteSelecionado && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setClienteSelecionado(null)}>&times;</span>
            <h2>Editar Cliente</h2>
            <input type="text" name="nome" value={clienteEditado.nome} onChange={handleInputChange} placeholder="Nome" />
            <input type="text" name="cpf" value={clienteEditado.cpf} onChange={handleInputChange} placeholder="CPF" />
            <input type="email" name="email" value={clienteEditado.email} onChange={handleInputChange} placeholder="Email" />
            <input type="text" name="telefone" value={clienteEditado.telefone} onChange={handleInputChange} placeholder="Telefone" />
            <input type="text" name="cep" value={clienteEditado.cep} onChange={handleInputChange} placeholder="CEP" />
            <input type="text" name="endereco" value={clienteEditado.endereco} onChange={handleInputChange} placeholder="Endereço" />
            <input type="text" name="bairro" value={clienteEditado.bairro} onChange={handleInputChange} placeholder="Bairro" />
            <input type="text" name="cidade" value={clienteEditado.cidade} onChange={handleInputChange} placeholder="Cidade" />
            <input type="text" name="estado" value={clienteEditado.estado} onChange={handleInputChange} placeholder="Estado" />
            <br />
            <button className='salvar-button' onClick={handleSalvarEdicao}>Salvar</button>
            <button className='cancelar-button'onClick={handleCancelarEdicao}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListarClientes;
