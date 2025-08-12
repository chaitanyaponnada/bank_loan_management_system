import React, { useState } from 'react';
import './App.css';
import Lend from './components/Lend/Lend';
import Payment from './components/Payment/Payment';
import Ledger from './components/Ledger/Ledger';
import AccountOverview from './components/AccountOverview/AccountOverview';
import AddCustomer from './components/AddCustomer/AddCustomer';

function App() {
  const [activeTab, setActiveTab] = useState('addCustomer'); 

  const renderComponent = () => {
    switch (activeTab) {
      case 'addCustomer':
        return <AddCustomer />;
      case 'lend':
        return <Lend />;
      case 'payment':
        return <Payment />;
      case 'ledger':
        return <Ledger />;
      case 'overview':
        return <AccountOverview />;
      default:
        return <AddCustomer />;
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>Bank Lending System</h1>
      </header>
      <nav className="navigation">
        <button className={`nav-button ${activeTab === 'addCustomer' ? 'active' : ''}`} onClick={() => setActiveTab('addCustomer')}>Add Customer</button>
        <button className={`nav-button ${activeTab === 'lend' ? 'active' : ''}`} onClick={() => setActiveTab('lend')}>Lend</button>
        <button className={`nav-button ${activeTab === 'payment' ? 'active' : ''}`} onClick={() => setActiveTab('payment')}>Payment</button>
        <button className={`nav-button ${activeTab === 'ledger' ? 'active' : ''}`} onClick={() => setActiveTab('ledger')}>Ledger</button>
        <button className={`nav-button ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Account Overview</button>
      </nav>
      <main className="component">
        {renderComponent()}
      </main>
    </div>
  );
}

export default App;
