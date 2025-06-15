import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PrivyProvider } from '@privy-io/react-auth';
import Navbar from './components/Navbar';
import LuggageEstimator from './components/LuggageEstimator';
import RewardsPage from './pages/RewardsPage';

// Minimal Privy configuration - just for wallet connection UI
const privyConfig = {
    appearance: {
        theme: 'light',
        accentColor: '#2563eb',
    },
    loginMethods: ['wallet', 'email'],
    embeddedWallets: {
        createOnLogin: 'users-without-wallets',
    },
};

function App() {
    return (
        <PrivyProvider
            appId={import.meta.env.VITE_PRIVY_APP_ID || 'demo-app-id'}
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