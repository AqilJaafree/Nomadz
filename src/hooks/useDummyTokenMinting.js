// 1. Simplified useDummyTokenMinting.js
import { useState, useEffect, useCallback } from 'react';
import { usePrivy, useSolanaWallets } from '@privy-io/react-auth';

// Mock token configuration
const TOKEN_NAME = 'NOMAD';
const TOKEN_SYMBOL = 'NOMAD';
const MOCK_TOKEN_MINT = 'NomadToken1234567890123456789012345678901234567890';

export const useDummyTokenMinting = () => {
    const { ready, authenticated } = usePrivy();
    const { wallets } = useSolanaWallets();
    
    const [isConnected, setIsConnected] = useState(false);
    const [balance, setBalance] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [transactionSignature, setTransactionSignature] = useState(null);
    const [totalEarned, setTotalEarned] = useState(0);

    // Load saved data from localStorage
    useEffect(() => {
        const savedBalance = localStorage.getItem('nomad_balance');
        const savedEarned = localStorage.getItem('nomad_total_earned');
        
        if (savedBalance) setBalance(parseInt(savedBalance));
        if (savedEarned) setTotalEarned(parseInt(savedEarned));
    }, []);

    // Check wallet connection status
    useEffect(() => {
        if (ready && authenticated && wallets && wallets.length > 0) {
            setIsConnected(true);
            setError(null);
        } else {
            setIsConnected(false);
        }
    }, [ready, authenticated, wallets]);

    // Get wallet instance
    const getWallet = useCallback(() => {
        if (!wallets || wallets.length === 0) {
            throw new Error('No Solana wallet connected');
        }
        return wallets[0];
    }, [wallets]);

    // Dummy token minting with realistic delay and effects
    const mintTokens = async (amount = 10, reason = 'Manual mint') => {
        if (!isConnected) {
            setError('Wallet not connected');
            return false;
        }

        setLoading(true);
        setError(null);
        setTransactionSignature(null);

        try {
            const wallet = getWallet();
            console.log('🔄 Minting tokens to wallet:', wallet.address);
            console.log('📝 Reason:', reason);

            // Simulate network delay (1-3 seconds)
            const delay = Math.random() * 2000 + 1000;
            await new Promise(resolve => setTimeout(resolve, delay));

            // Generate realistic transaction signature
            const mockTxSignature = generateMockTxSignature();
            
            // Update balances
            const newBalance = balance + amount;
            const newTotalEarned = totalEarned + amount;
            
            setBalance(newBalance);
            setTotalEarned(newTotalEarned);
            setTransactionSignature(mockTxSignature);
            
            // Save to localStorage
            localStorage.setItem('nomad_balance', newBalance.toString());
            localStorage.setItem('nomad_total_earned', newTotalEarned.toString());
            
            // Save transaction history
            saveTransactionHistory({
                signature: mockTxSignature,
                amount,
                reason,
                timestamp: new Date().toISOString(),
                walletAddress: wallet.address
            });

            console.log('✅ Tokens minted successfully:', {
                amount,
                signature: mockTxSignature,
                newBalance,
                reason
            });

            // Clear success message after 8 seconds
            setTimeout(() => {
                setTransactionSignature(null);
            }, 8000);

            return true;
        } catch (err) {
            console.error('❌ Error minting tokens:', err);
            setError(`Failed to mint tokens: ${err.message}`);
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Generate realistic transaction signature
    const generateMockTxSignature = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let signature = '';
        for (let i = 0; i < 88; i++) {
            signature += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return signature;
    };

    // Save transaction to history
    const saveTransactionHistory = (transaction) => {
        const history = getTransactionHistory();
        const updatedHistory = [transaction, ...history].slice(0, 50); // Keep last 50
        localStorage.setItem('nomad_tx_history', JSON.stringify(updatedHistory));
    };

    // Get transaction history
    const getTransactionHistory = () => {
        const history = localStorage.getItem('nomad_tx_history');
        return history ? JSON.parse(history) : [];
    };

    // Reset all data (for testing)
    const resetWallet = () => {
        setBalance(0);
        setTotalEarned(0);
        setTransactionSignature(null);
        setError(null);
        localStorage.removeItem('nomad_balance');
        localStorage.removeItem('nomad_total_earned');
        localStorage.removeItem('nomad_tx_history');
        console.log('🔄 Wallet data reset');
    };

    // Simulate earning tokens from luggage estimation
    const earnFromEstimation = async (estimationData) => {
        const baseReward = 10;
        const accuracyBonus = estimationData.confidence > 0.8 ? 5 : 0;
        const totalReward = baseReward + accuracyBonus;
        
        return await mintTokens(
            totalReward, 
            `Luggage estimation (${estimationData.weight}kg, ${Math.round(estimationData.confidence * 100)}% confidence)`
        );
    };

    // Get wallet address for display
    const getWalletAddress = () => {
        if (!isConnected) return null;
        try {
            const wallet = getWallet();
            return wallet.address;
        } catch {
            return null;
        }
    };

    // Check if user has made any estimations today
    const canEarnToday = () => {
        const today = new Date().toDateString();
        const history = getTransactionHistory();
        const todayTransactions = history.filter(tx => 
            new Date(tx.timestamp).toDateString() === today &&
            tx.reason.includes('Luggage estimation')
        );
        return todayTransactions.length < 5; // Max 5 estimations per day
    };

    // Clear error
    const clearError = () => setError(null);

    return {
        // State
        isConnected,
        balance,
        totalEarned,
        loading,
        error,
        transactionSignature,
        tokenMintAddress: MOCK_TOKEN_MINT,

        // Actions
        mintTokens,
        earnFromEstimation,
        resetWallet,
        clearError,

        // Utils
        getWallet,
        getWalletAddress,
        getTransactionHistory,
        canEarnToday,
        
        // Constants
        TOKEN_NAME,
        TOKEN_SYMBOL,
    };
};
