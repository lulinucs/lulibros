import React, { useState } from 'react';
import './App.css';
import PesquisaLivro from './PesquisaLivro';
import NovaVenda from './NovaVenda';
import ListaVendas from './ListaVendas';
import ListarClientes from './ListarClientes';
import FileUpload from './FileUpload'; 
import logo from './logo512.png'; 
import ListarLivro from './ListarLivros'; 
import RelatorioVendas from './RelatorioVendas'; // Importe o componente RelatorioVendas

function App() {
  const [selectedComponent, setSelectedComponent] = useState('PesquisaLivro');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const renderComponent = (component) => {
    switch (component) {
      case 'PesquisaLivro':
        return <PesquisaLivro />;
      case 'NovaVenda':
        return <NovaVenda />;
      case 'ListaVendas':
        return <ListaVendas />;
      case 'ListarClientes':
        return <ListarClientes />;
      case 'FileUpload': 
        return <FileUpload />;
      case 'ListarLivro': 
        return <ListarLivro />;
      case 'RelatorioVendas': // Adicione a case para RelatorioVendas
        return <RelatorioVendas />;
      default:
        return null;
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} alt="Logo" className="logo" /> 
        <p>A solução definitiva pros problemas do Versa</p> 
        <div className="mobile-menu-icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
        </div>
      </header>
      <nav className={`menu ${mobileMenuOpen ? 'open' : ''}`}>
      <button className={`hide-mobile ${selectedComponent === 'NovaVenda' ? 'active' : ''}`} onClick={() => setSelectedComponent('NovaVenda')}>Nova Venda</button>
      <button className={`${selectedComponent === 'PesquisaLivro' ? 'active' : ''}`} onClick={() => setSelectedComponent('PesquisaLivro')}>Venda Rápida</button>
      <button className={`${selectedComponent === 'ListaVendas' ? 'active' : ''}`} onClick={() => setSelectedComponent('ListaVendas')}>Vendas</button>
      <button className={`hide-mobile ${selectedComponent === 'ListarClientes' ? 'active' : ''}`} onClick={() => setSelectedComponent('ListarClientes')}>Clientes</button>
      <button className={`hide-mobile ${selectedComponent === 'FileUpload' ? 'active' : ''}`} onClick={() => setSelectedComponent('FileUpload')}>Adicionar Estoque</button> 
      <button className={`hide-mobile ${selectedComponent === 'ListarLivro' ? 'active' : ''}`} onClick={() => setSelectedComponent('ListarLivro')}>Pesquisar</button>
      <button className={`hide-mobile ${selectedComponent === 'RelatorioVendas' ? 'active' : ''}`} onClick={() => setSelectedComponent('RelatorioVendas')}>Relatório de Vendas</button>
      </nav>
      <main>
        <div className="main-content">{renderComponent(selectedComponent)}</div>
      </main>
      <footer>
        <p>© 2024 Lulibros. Alguns direitos reservados.</p>
      </footer>
    </div>
  );
}

export default App;
