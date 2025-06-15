// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PrivyProvider } from '@privy-io/react-auth';
import Navbar from './components/Navbar';
import LuggageEstimator from './components/LuggageEstimator';
import RewardsPage from './pages/RewardsPage';

// Privy configuration
const privyConfig = {
  appearance: {
    theme: 'light',
    accentColor: '#2563eb',
    logo: 'https://your-domain.com/logo.png', // Replace with your logo
  },
  // Configure supported login methods
  loginMethods: ['wallet', 'email', 'sms'],
  // Configure supported wallets
  supportedChains: [
    {
      id: 101, // Solana Mainnet
      name: 'Solana',
      network: 'mainnet-beta',
      rpcUrl: 'https://api.mainnet-beta.solana.com',
    },
    {
      id: 103, // Solana Devnet  
      name: 'Solana Devnet',
      network: 'devnet',
      rpcUrl: 'https://api.devnet.solana.com',
    }
  ],
  // Enable Solana wallet support
  embeddedWallets: {
    createOnLogin: 'users-without-wallets',
    requireUserPasswordOnCreate: false,
  },
};

function App() {
  return (
    <PrivyProvider
      appId={import.meta.env.VITE_PRIVY_APP_ID || 'your-privy-app-id'} // Replace with your Privy App ID
      config={privyConfig}
    >
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<LuggageEstimator />} />
            <Route path="/rewards" element={<RewardsPage />} />
          </Routes>
        </div>
      </Router>
    </PrivyProvider>
  );
}

export default App;