import React, { useState, useEffect } from 'react';
import { usePrivy, useSolanaWallets } from '@privy-io/react-auth';
import { 
    Coins, 
    Gift, 
    Zap, 
    Camera,
    CheckCircle, 
    AlertCircle, 
    Loader, 
    ExternalLink,
    Trophy,
    Settings,
    History,
    RefreshCw,
    Award
} from 'lucide-react';
import { useDummyTokenMinting } from '../hooks/useDummyTokenMinting';

const RewardsPage = () => {
    const { ready, authenticated, user, login } = usePrivy();
    const { wallets } = useSolanaWallets();
    const [showHistory, setShowHistory] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    
    const {
        isConnected,
        balance,
        totalEarned,
        loading,
        error,
        mintTokens,
        transactionSignature,
        tokenMintAddress,
        getWalletAddress,
        getTransactionHistory,
        canEarnToday,
        resetWallet,
        clearError,
        TOKEN_NAME,
        TOKEN_SYMBOL
    } = useDummyTokenMinting();

    const [transactionHistory, setTransactionHistory] = useState([]);

    // Load transaction history
    useEffect(() => {
        if (isConnected) {
            setTransactionHistory(getTransactionHistory());
        }
    }, [isConnected, balance]); // Refresh when balance changes

    const handleManualMint = async () => {
        const success = await mintTokens(10, 'Manual mint for testing');
        if (success) {
            setTransactionHistory(getTransactionHistory());
        }
    };

    const handleResetWallet = () => {
        if (confirm('Are you sure you want to reset all wallet data? This cannot be undone.')) {
            resetWallet();
            setTransactionHistory([]);
        }
    };

    const formatDate = (timestamp) => {
        return new Date(timestamp).toLocaleString();
    };

    const getDailyEarnings = () => {
        const today = new Date().toDateString();
        return transactionHistory
            .filter(tx => new Date(tx.timestamp).toDateString() === today)
            .reduce((sum, tx) => sum + tx.amount, 0);
    };

    if (!ready) {
        return (
            <div style={styles.loadingContainer}>
                <Loader size={48} style={{ animation: 'spin 1s linear infinite' }} />
                <p>Loading Privy...</p>
            </div>
        );
    }

    if (!authenticated) {
        return (
            <div style={styles.container}>
                <div style={styles.unauthenticatedCard}>
                    <Gift size={64} color="#6b7280" />
                    <h2 style={styles.unauthenticatedTitle}>Connect Your Wallet</h2>
                    <p style={styles.unauthenticatedText}>
                        Connect your Solana wallet to start earning NOMAD tokens
                    </p>
                    <button onClick={login} style={styles.connectButton}>
                        Connect Wallet
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <div style={styles.titleSection}>
                    <div style={styles.titleIcon}>
                        <Trophy size={32} color="#f59e0b" />
                    </div>
                    <div>
                        <h1 style={styles.title}>NOMAD Rewards</h1>
                        <p style={styles.subtitle}>
                            Earn {TOKEN_NAME} tokens for luggage estimations (Demo Mode)
                        </p>
                    </div>
                </div>
                
                <div style={styles.headerButtons}>
                    <button
                        onClick={() => setShowHistory(!showHistory)}
                        style={styles.headerButton}
                    >
                        <History size={16} />
                        History
                    </button>
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        style={styles.headerButton}
                    >
                        <Settings size={16} />
                        Settings
                    </button>
                </div>
            </div>

            {/* Settings Panel */}
            {showSettings && (
                <div style={styles.settingsPanel}>
                    <h3 style={styles.settingsTitle}>Demo Settings</h3>
                    <div style={styles.settingsContent}>
                        <p style={styles.settingsNote}>
                            🎮 This is a demo version with simulated token minting
                        </p>
                        <div style={styles.settingsButtons}>
                            <button 
                                onClick={handleResetWallet} 
                                style={styles.resetButton}
                            >
                                <RefreshCw size={16} />
                                Reset Wallet Data
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Cards */}
            <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                    <div style={styles.statIcon}>
                        <Coins size={24} color="#16a34a" />
                    </div>
                    <div style={styles.statContent}>
                        <div style={styles.statValue}>{balance}</div>
                        <div style={styles.statLabel}>Current Balance</div>
                    </div>
                </div>
                
                <div style={styles.statCard}>
                    <div style={styles.statIcon}>
                        <Award size={24} color="#2563eb" />
                    </div>
                    <div style={styles.statContent}>
                        <div style={styles.statValue}>{totalEarned}</div>
                        <div style={styles.statLabel}>Total Earned</div>
                    </div>
                </div>
                
                <div style={styles.statCard}>
                    <div style={styles.statIcon}>
                        <Zap size={24} color="#f59e0b" />
                    </div>
                    <div style={styles.statContent}>
                        <div style={styles.statValue}>{getDailyEarnings()}</div>
                        <div style={styles.statLabel}>Today's Earnings</div>
                    </div>
                </div>
            </div>

            {/* Wallet Status */}
            <div style={styles.walletCard}>
                <div style={styles.walletHeader}>
                    <div style={styles.walletIcon}>
                        <Coins size={24} color="#16a34a" />
                    </div>
                    <div style={styles.walletInfo}>
                        <h3 style={styles.walletTitle}>
                            {isConnected ? '✅ Wallet Connected' : '❌ Wallet Disconnected'}
                        </h3>
                        <p style={styles.walletAddress}>
                            {getWalletAddress() 
                                ? `${getWalletAddress().slice(0, 8)}...${getWalletAddress().slice(-8)}`
                                : 'No wallet connected'
                            }
                        </p>
                    </div>
                </div>
                
                {isConnected && (
                    <div style={styles.tokenInfo}>
                        <div style={styles.tokenDetail}>
                            <span style={styles.tokenLabel}>Token:</span>
                            <span style={styles.tokenValue}>{TOKEN_NAME} ({TOKEN_SYMBOL})</span>
                        </div>
                        <div style={styles.tokenDetail}>
                            <span style={styles.tokenLabel}>Contract:</span>
                            <span style={styles.tokenValue}>
                                {`${tokenMintAddress.slice(0, 8)}...${tokenMintAddress.slice(-8)}`}
                                <span style={styles.demoLabel}>DEMO</span>
                            </span>
                        </div>
                        <div style={styles.tokenDetail}>
                            <span style={styles.tokenLabel}>Daily Limit:</span>
                            <span style={styles.tokenValue}>
                                {canEarnToday() ? '✅ Available' : '❌ Reached (5/day)'}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Error Display */}
            {error && (
                <div style={styles.errorCard}>
                    <AlertCircle size={20} />
                    <span>{error}</span>
                    <button onClick={clearError} style={styles.clearErrorBtn}>×</button>
                </div>
            )}

            {/* Success Display */}
            {transactionSignature && (
                <div style={styles.successCard}>
                    <CheckCircle size={20} />
                    <span>10 NOMAD tokens minted successfully! 🎉</span>
                    <div style={styles.mockTxLink}>
                        <span style={styles.mockTxText}>
                            TX: {transactionSignature.slice(0, 8)}...{transactionSignature.slice(-8)}
                        </span>
                        <span style={styles.demoLabel}>DEMO</span>
                    </div>
                </div>
            )}

            {/* Mint Button */}
            {isConnected ? (
                <div style={styles.mintCard}>
                    <h3 style={styles.mintTitle}>Mint NOMAD Tokens</h3>
                    <p style={styles.mintDescription}>
                        Click the button below to simulate minting 10 NOMAD tokens
                    </p>
                    <button
                        onClick={handleManualMint}
                        disabled={loading}
                        style={{
                            ...styles.mintButton,
                            opacity: loading ? 0.6 : 1
                        }}
                    >
                        {loading ? (
                            <>
                                <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} />
                                <span>Minting...</span>
                            </>
                        ) : (
                            <>
                                <Zap size={20} />
                                <span>Mint 10 {TOKEN_NAME}</span>
                            </>
                        )}
                    </button>
                    <p style={styles.demoNote}>
                        🎮 Demo mode - No real tokens are created
                    </p>
                </div>
            ) : null}

            {/* Transaction History */}
            {showHistory && isConnected && (
                <div style={styles.historyCard}>
                    <h3 style={styles.historyTitle}>
                        <History size={24} />
                        Transaction History
                    </h3>
                    
                    {transactionHistory.length === 0 ? (
                        <div style={styles.emptyHistory}>
                            <Camera size={48} color="#9ca3af" />
                            <p style={styles.emptyText}>No transactions yet</p>
                            <p style={styles.emptySubtext}>
                                Start minting tokens to see your history
                            </p>
                        </div>
                    ) : (
                        <div style={styles.historyList}>
                            {transactionHistory.slice(0, 10).map((tx, index) => (
                                <div key={index} style={styles.historyItem}>
                                    <div style={styles.historyIcon}>
                                        <Zap size={16} color="#16a34a" />
                                    </div>
                                    <div style={styles.historyDetails}>
                                        <div style={styles.historyAmount}>
                                            +{tx.amount} {TOKEN_NAME}
                                        </div>
                                        <div style={styles.historyReason}>
                                            {tx.reason}
                                        </div>
                                        <div style={styles.historyDate}>
                                            {formatDate(tx.timestamp)}
                                        </div>
                                    </div>
                                    <div style={styles.historyTx}>
                                        <span style={styles.historyTxText}>
                                            {tx.signature.slice(0, 6)}...
                                        </span>
                                        <span style={styles.demoLabel}>DEMO</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* How It Works */}
            <div style={styles.howItWorksCard}>
                <h3 style={styles.howItWorksTitle}>How to Earn {TOKEN_NAME} Tokens</h3>
                <div style={styles.stepsList}>
                    <div style={styles.step}>
                        <div style={styles.stepNumber}>1</div>
                        <div style={styles.stepContent}>
                            <h4 style={styles.stepTitle}>Take Luggage Photo</h4>
                            <p style={styles.stepDescription}>
                                Upload or capture a photo of your luggage using our AI estimator
                            </p>
                        </div>
                    </div>
                    <div style={styles.step}>
                        <div style={styles.stepNumber}>2</div>
                        <div style={styles.stepContent}>
                            <h4 style={styles.stepTitle}>Get AI Estimation</h4>
                            <p style={styles.stepDescription}>
                                Our Edge Impulse model provides accurate weight prediction
                            </p>
                        </div>
                    </div>
                    <div style={styles.step}>
                        <div style={styles.stepNumber}>3</div>
                        <div style={styles.stepContent}>
                            <h4 style={styles.stepTitle}>Earn Tokens Automatically</h4>
                            <p style={styles.stepDescription}>
                                Receive 10-15 {TOKEN_NAME} tokens based on estimation confidence
                            </p>
                        </div>
                    </div>
                </div>
                <div style={styles.rewardStructure}>
                    <h4 style={styles.rewardTitle}>Reward Structure</h4>
                    <div style={styles.rewardItems}>
                        <div style={styles.rewardItem}>
                            <span style={styles.rewardAmount}>10 {TOKEN_NAME}</span>
                            <span style={styles.rewardDesc}>Base reward per estimation</span>
                        </div>
                        <div style={styles.rewardItem}>
                            <span style={styles.rewardAmount}>+5 {TOKEN_NAME}</span>
                            <span style={styles.rewardDesc}>Bonus for high confidence ({'>'}80%)</span>
                        </div>
                        <div style={styles.rewardItem}>
                            <span style={styles.rewardAmount}>5 per day</span>
                            <span style={styles.rewardDesc}>Maximum estimations per day</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Styles (abbreviated for space - full styles would be much longer)
const styles = {
    container: { minHeight: 'calc(100vh - 70px)', backgroundColor: '#f8fafc', padding: '24px' },
    loadingContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 70px)', gap: '16px', color: '#6b7280' },
    header: { maxWidth: '1000px', margin: '0 auto 32px auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' },
    titleSection: { display: 'flex', alignItems: 'center', gap: '16px' },
    titleIcon: { padding: '12px', backgroundColor: '#fef3c7', borderRadius: '12px' },
    title: { fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', margin: '0 0 8px 0' },
    subtitle: { color: '#6b7280', fontSize: '1.1rem', margin: 0 },
    headerButtons: { display: 'flex', gap: '12px' },
    headerButton: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem' },
    settingsPanel: { maxWidth: '1000px', margin: '0 auto 24px auto', backgroundColor: '#fff3cd', border: '1px solid #fbbf24', borderRadius: '12px', padding: '20px' },
    settingsTitle: { fontSize: '1.25rem', fontWeight: '600', color: '#92400e', margin: '0 0 16px 0' },
    settingsContent: { display: 'flex', flexDirection: 'column', gap: '16px' },
    settingsNote: { fontSize: '0.875rem', color: '#92400e', margin: 0 },
    settingsButtons: { display: 'flex', gap: '12px' },
    resetButton: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem' },
    statsGrid: { maxWidth: '1000px', margin: '0 auto 24px auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' },
    statCard: { backgroundColor: 'white', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb' },
    statIcon: { padding: '12px', backgroundColor: '#f0f9ff', borderRadius: '8px' },
    statContent: { flex: 1 },
    statValue: { fontSize: '1.875rem', fontWeight: 'bold', color: '#1f2937', margin: '0 0 4px 0' },
    statLabel: { fontSize: '0.875rem', color: '#6b7280', fontWeight: '500' },
    walletCard: { maxWidth: '1000px', margin: '0 auto 24px auto', backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb' },
    walletHeader: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' },
    walletIcon: { padding: '12px', backgroundColor: '#dcfce7', borderRadius: '8px' },
    walletInfo: { flex: 1 },
    walletTitle: { fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', margin: '0 0 4px 0' },
    walletAddress: { fontSize: '0.875rem', color: '#6b7280', fontFamily: 'monospace', margin: 0 },
    tokenInfo: { display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' },
    tokenDetail: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    tokenLabel: { fontSize: '0.875rem', color: '#6b7280', fontWeight: '500' },
    tokenValue: { fontSize: '0.875rem', color: '#1f2937', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '8px' },
    demoLabel: { padding: '2px 6px', backgroundColor: '#fbbf24', color: 'white', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' },
    errorCard: { maxWidth: '1000px', margin: '0 auto 24px auto', display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '8px', border: '1px solid #fecaca' },
    clearErrorBtn: { marginLeft: 'auto', backgroundColor: 'transparent', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '1.25rem' },
    successCard: { maxWidth: '1000px', margin: '0 auto 24px auto', display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '8px', border: '1px solid #bbf7d0' },
    mockTxLink: { display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' },
    mockTxText: { fontSize: '0.875rem', fontFamily: 'monospace' },
    mintCard: { maxWidth: '1000px', margin: '0 auto 24px auto', backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb', textAlign: 'center' },
    mintTitle: { fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', margin: '0 0 12px 0' },
    mintDescription: { color: '#6b7280', margin: '0 0 24px 0', lineHeight: '1.6' },
    mintButton: { display: 'inline-flex', alignItems: 'center', gap: '12px', padding: '16px 32px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1.125rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease', marginBottom: '16px' },
    demoNote: { fontSize: '0.875rem', color: '#6b7280', margin: 0, fontStyle: 'italic' },
    historyCard: { maxWidth: '1000px', margin: '0 auto 24px auto', backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb' },
    historyTitle: { display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', margin: '0 0 20px 0' },
    emptyHistory: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 24px', textAlign: 'center' },
    emptyText: { fontSize: '1.125rem', color: '#6b7280', margin: '16px 0 8px 0', fontWeight: '500' },
    emptySubtext: { color: '#9ca3af', margin: 0 },
    historyList: { display: 'flex', flexDirection: 'column', gap: '12px' },
    historyItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' },
    historyIcon: { padding: '8px', backgroundColor: '#dcfce7', borderRadius: '6px' },
    historyDetails: { flex: 1 },
    historyAmount: { fontSize: '1rem', fontWeight: '600', color: '#16a34a', margin: '0 0 4px 0' },
    historyReason: { fontSize: '0.875rem', color: '#1f2937', margin: '0 0 4px 0' },
    historyDate: { fontSize: '0.75rem', color: '#6b7280', margin: 0 },
    historyTx: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' },
    historyTxText: { fontSize: '0.75rem', color: '#6b7280', fontFamily: 'monospace' },
    howItWorksCard: { maxWidth: '1000px', margin: '0 auto', backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb' },
    howItWorksTitle: { fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', margin: '0 0 24px 0', textAlign: 'center' },
    stepsList: { display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' },
    step: { display: 'flex', alignItems: 'flex-start', gap: '16px' },
    stepNumber: { width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#2563eb', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 'bold', flexShrink: 0 },
    stepContent: { flex: 1 },
    stepTitle: { fontSize: '1rem', fontWeight: '600', color: '#1f2937', margin: '0 0 8px 0' },
    stepDescription: { color: '#6b7280', lineHeight: '1.5', margin: 0 },
    rewardStructure: { borderTop: '1px solid #e5e7eb', paddingTop: '24px' },
    rewardTitle: { fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', margin: '0 0 16px 0', textAlign: 'center' },
    rewardItems: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' },
    rewardItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd' },
    rewardAmount: { fontSize: '0.875rem', fontWeight: '600', color: '#0369a1' },
    rewardDesc: { fontSize: '0.875rem', color: '#6b7280' },
    unauthenticatedCard: { maxWidth: '400px', margin: '0 auto', padding: '48px 32px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', textAlign: 'center', marginTop: '80px' },
    unauthenticatedTitle: { fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', margin: '24px 0 16px 0' },
    unauthenticatedText: { color: '#6b7280', lineHeight: '1.6', margin: '0 0 24px 0' },
    connectButton: { padding: '12px 24px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '500', cursor: 'pointer' }
};

// Add responsive styles and hover effects
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .mint-button:hover:not(:disabled) {
    background-color: #1d4ed8 !important;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(37, 99, 235, 0.3);
  }
  
  .header-button:hover {
    background-color: #e5e7eb !important;
    transform: translateY(-1px);
  }
  
  .reset-button:hover {
    background-color: #dc2626 !important;
    transform: translateY(-1px);
  }
  
  .connect-button:hover {
    background-color: #1d4ed8 !important;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(37, 99, 235, 0.3);
  }
  
  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1) !important;
  }
  
  .history-item:hover {
    background-color: #f3f4f6 !important;
  }
  
  @media (max-width: 768px) {
    .header {
      flex-direction: column !important;
      align-items: stretch !important;
    }
    
    .title-section {
      flex-direction: column !important;
      text-align: center !important;
    }
    
    .header-buttons {
      justify-content: center !important;
    }
    
    .stats-grid {
      grid-template-columns: 1fr !important;
    }
    
    .steps-list {
      gap: 24px !important;
    }
    
    .step {
      flex-direction: column !important;
      text-align: center !important;
      align-items: center !important;
    }
    
    .reward-items {
      grid-template-columns: 1fr !important;
    }
    
    .history-item {
      flex-direction: column !important;
      align-items: flex-start !important;
      gap: 8px !important;
    }
    
    .history-tx {
      align-self: stretch !important;
      align-items: flex-start !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default RewardsPage;