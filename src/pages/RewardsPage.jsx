// src/pages/RewardsPage.jsx
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
    Star
} from 'lucide-react';
import { useSolanaTokenMinting } from '../hooks/useSolanaTokenMinting';

const RewardsPage = () => {
    const { ready, authenticated, user } = usePrivy();
    const { wallets } = useSolanaWallets();
    const [userImages, setUserImages] = useState([]);
    const [totalRewards, setTotalRewards] = useState(0);
    
    const {
        isConnected,
        balance,
        loading,
        error,
        mintTokens,
        transactionSignature,
        tokenMintAddress
    } = useSolanaTokenMinting();

    // Mock user data - in production, this would come from your backend
    useEffect(() => {
        if (authenticated) {
            // Simulate loading user's image submissions
            const mockImages = [
                { id: 1, timestamp: new Date().toISOString(), weight: 23.5, rewarded: true },
                { id: 2, timestamp: new Date(Date.now() - 86400000).toISOString(), weight: 18.2, rewarded: true },
                { id: 3, timestamp: new Date(Date.now() - 172800000).toISOString(), weight: 31.1, rewarded: false },
            ];
            setUserImages(mockImages);
            setTotalRewards(mockImages.filter(img => img.rewarded).length * 10);
        }
    }, [authenticated]);

    const handleClaimReward = async (imageId) => {
        if (!isConnected) {
            alert('Please connect your Solana wallet first');
            return;
        }

        try {
            const success = await mintTokens(10); // Mint 10 tokens per image
            if (success) {
                // Update local state to mark as rewarded
                setUserImages(prev => 
                    prev.map(img => 
                        img.id === imageId ? { ...img, rewarded: true } : img
                    )
                );
                setTotalRewards(prev => prev + 10);
            }
        } catch (err) {
            console.error('Failed to claim reward:', err);
        }
    };

    const getWalletAddress = () => {
        if (wallets && wallets.length > 0) {
            return wallets[0].address;
        }
        return user?.wallet?.address || null;
    };

    if (!ready) {
        return (
            <div style={styles.loadingContainer}>
                <Loader size={48} style={{ animation: 'spin 1s linear infinite' }} />
                <p>Loading...</p>
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
                        Connect your wallet to view and claim your luggage estimation rewards
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div style={styles.titleSection}>
                    <div style={styles.titleIcon}>
                        <Trophy size={32} color="#f59e0b" />
                    </div>
                    <div>
                        <h1 style={styles.title}>Your Rewards</h1>
                        <p style={styles.subtitle}>
                            Earn NOMAD tokens for every luggage estimation
                        </p>
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
                        <h3 style={styles.walletTitle}>Wallet Status</h3>
                        <p style={styles.walletAddress}>
                            {getWalletAddress() 
                                ? `${getWalletAddress().slice(0, 8)}...${getWalletAddress().slice(-8)}`
                                : 'No wallet connected'
                            }
                        </p>
                    </div>
                </div>
                
                {isConnected && (
                    <div style={styles.balanceSection}>
                        <div style={styles.balanceItem}>
                            <span style={styles.balanceLabel}>NOMAD Balance</span>
                            <span style={styles.balanceValue}>
                                {loading ? (
                                    <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                                ) : (
                                    `${balance} NOMAD`
                                )}
                            </span>
                        </div>
                        <div style={styles.balanceItem}>
                            <span style={styles.balanceLabel}>Total Earned</span>
                            <span style={styles.balanceValue}>{totalRewards} NOMAD</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Token Info */}
            <div style={styles.tokenInfoCard}>
                <div style={styles.tokenHeader}>
                    <Star size={24} color="#7c3aed" />
                    <h3 style={styles.tokenTitle}>NOMAD Token</h3>
                </div>
                <div style={styles.tokenDetails}>
                    <p style={styles.tokenDescription}>
                        Earn 10 NOMAD tokens for each luggage weight estimation you provide.
                        Use tokens for premium features and travel rewards.
                    </p>
                    {tokenMintAddress && (
                        <div style={styles.contractInfo}>
                            <span style={styles.contractLabel}>Token Address:</span>
                            <a 
                                href={`https://explorer.solana.com/address/${tokenMintAddress}?cluster=devnet`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={styles.contractLink}
                            >
                                {`${tokenMintAddress.slice(0, 8)}...${tokenMintAddress.slice(-8)}`}
                                <ExternalLink size={14} />
                            </a>
                        </div>
                    )}
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div style={styles.errorCard}>
                    <AlertCircle size={20} />
                    <span>{error}</span>
                </div>
            )}

            {/* Success Display */}
            {transactionSignature && (
                <div style={styles.successCard}>
                    <CheckCircle size={20} />
                    <span>Tokens minted successfully!</span>
                    <a 
                        href={`https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.txLink}
                    >
                        View Transaction <ExternalLink size={14} />
                    </a>
                </div>
            )}

            {/* Image Submissions */}
            <div style={styles.submissionsCard}>
                <h3 style={styles.submissionsTitle}>
                    <Camera size={24} />
                    Your Submissions
                </h3>
                
                {userImages.length === 0 ? (
                    <div style={styles.emptyState}>
                        <Camera size={48} color="#9ca3af" />
                        <p style={styles.emptyText}>No luggage estimations yet</p>
                        <p style={styles.emptySubtext}>
                            Start estimating luggage weights to earn NOMAD tokens
                        </p>
                    </div>
                ) : (
                    <div style={styles.imagesList}>
                        {userImages.map((image) => (
                            <div key={image.id} style={styles.imageCard}>
                                <div style={styles.imageInfo}>
                                    <div style={styles.imageIcon}>
                                        <Camera size={20} color="#6b7280" />
                                    </div>
                                    <div style={styles.imageDetails}>
                                        <div style={styles.imageWeight}>
                                            Weight: {image.weight} kg
                                        </div>
                                        <div style={styles.imageDate}>
                                            {new Date(image.timestamp).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                
                                <div style={styles.rewardSection}>
                                    {image.rewarded ? (
                                        <div style={styles.rewardedBadge}>
                                            <CheckCircle size={16} />
                                            <span>10 NOMAD Earned</span>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleClaimReward(image.id)}
                                            disabled={loading || !isConnected}
                                            style={{
                                                ...styles.claimButton,
                                                opacity: (loading || !isConnected) ? 0.6 : 1
                                            }}
                                        >
                                            {loading ? (
                                                <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                                            ) : (
                                                <>
                                                    <Zap size={16} />
                                                    <span>Claim 10 NOMAD</span>
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* How It Works */}
            <div style={styles.howItWorksCard}>
                <h3 style={styles.howItWorksTitle}>How to Earn Rewards</h3>
                <div style={styles.stepsList}>
                    <div style={styles.step}>
                        <div style={styles.stepNumber}>1</div>
                        <div style={styles.stepContent}>
                            <h4 style={styles.stepTitle}>Upload Luggage Photo</h4>
                            <p style={styles.stepDescription}>
                                Take a photo of your luggage using our AI estimator
                            </p>
                        </div>
                    </div>
                    <div style={styles.step}>
                        <div style={styles.stepNumber}>2</div>
                        <div style={styles.stepContent}>
                            <h4 style={styles.stepTitle}>Get Weight Estimation</h4>
                            <p style={styles.stepDescription}>
                                Our AI provides an accurate weight prediction
                            </p>
                        </div>
                    </div>
                    <div style={styles.step}>
                        <div style={styles.stepNumber}>3</div>
                        <div style={styles.stepContent}>
                            <h4 style={styles.stepTitle}>Claim NOMAD Tokens</h4>
                            <p style={styles.stepDescription}>
                                Receive 10 NOMAD tokens for each estimation
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        minHeight: 'calc(100vh - 70px)',
        backgroundColor: '#f8fafc',
        padding: '24px',
    },
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 70px)',
        gap: '16px',
        color: '#6b7280',
    },
    header: {
        maxWidth: '800px',
        margin: '0 auto 32px auto',
    },
    titleSection: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
    },
    titleIcon: {
        padding: '12px',
        backgroundColor: '#fef3c7',
        borderRadius: '12px',
    },
    title: {
        fontSize: '2rem',
        fontWeight: 'bold',
        color: '#1f2937',
        margin: '0 0 8px 0',
    },
    subtitle: {
        color: '#6b7280',
        fontSize: '1.1rem',
        margin: 0,
    },
    walletCard: {
        maxWidth: '800px',
        margin: '0 auto 24px auto',
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
    },
    walletHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '16px',
    },
    walletIcon: {
        padding: '12px',
        backgroundColor: '#dcfce7',
        borderRadius: '8px',
    },
    walletInfo: {
        flex: 1,
    },
    walletTitle: {
        fontSize: '1.25rem',
        fontWeight: '600',
        color: '#1f2937',
        margin: '0 0 4px 0',
    },
    walletAddress: {
        fontSize: '0.875rem',
        color: '#6b7280',
        fontFamily: 'monospace',
        margin: 0,
    },
    balanceSection: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
    },
    balanceItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
    },
    balanceLabel: {
        fontSize: '0.875rem',
        color: '#6b7280',
        fontWeight: '500',
    },
    balanceValue: {
        fontSize: '1.25rem',
        fontWeight: 'bold',
        color: '#2563eb',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    tokenInfoCard: {
        maxWidth: '800px',
        margin: '0 auto 24px auto',
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
    },
    tokenHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '16px',
    },
    tokenTitle: {
        fontSize: '1.25rem',
        fontWeight: '600',
        color: '#1f2937',
        margin: 0,
    },
    tokenDetails: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    tokenDescription: {
        color: '#6b7280',
        lineHeight: '1.6',
        margin: 0,
    },
    contractInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '0.875rem',
    },
    contractLabel: {
        color: '#6b7280',
        fontWeight: '500',
    },
    contractLink: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        color: '#2563eb',
        textDecoration: 'none',
        fontFamily: 'monospace',
    },
    errorCard: {
        maxWidth: '800px',
        margin: '0 auto 24px auto',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '16px',
        backgroundColor: '#fee2e2',
        color: '#dc2626',
        borderRadius: '8px',
        border: '1px solid #fecaca',
    },
    successCard: {
        maxWidth: '800px',
        margin: '0 auto 24px auto',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '16px',
        backgroundColor: '#dcfce7',
        color: '#166534',
        borderRadius: '8px',
        border: '1px solid #bbf7d0',
    },
    txLink: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        color: '#059669',
        textDecoration: 'none',
        fontSize: '0.875rem',
        marginLeft: 'auto',
    },
    submissionsCard: {
        maxWidth: '800px',
        margin: '0 auto 24px auto',
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
    },
    submissionsTitle: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontSize: '1.25rem',
        fontWeight: '600',
        color: '#1f2937',
        margin: '0 0 20px 0',
    },
    emptyState: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '48px 24px',
        textAlign: 'center',
    },
    emptyText: {
        fontSize: '1.125rem',
        color: '#6b7280',
        margin: '16px 0 8px 0',
        fontWeight: '500',
    },
    emptySubtext: {
        color: '#9ca3af',
        margin: 0,
    },
    imagesList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    imageCard: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px',
        backgroundColor: '#f9fafb',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
    },
    imageInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    imageIcon: {
        padding: '8px',
        backgroundColor: '#e5e7eb',
        borderRadius: '8px',
    },
    imageDetails: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
    },
    imageWeight: {
        fontSize: '1rem',
        fontWeight: '600',
        color: '#1f2937',
    },
    imageDate: {
        fontSize: '0.875rem',
        color: '#6b7280',
    },
    rewardSection: {
        display: 'flex',
        alignItems: 'center',
    },
    rewardedBadge: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 12px',
        backgroundColor: '#dcfce7',
        color: '#166534',
        borderRadius: '20px',
        fontSize: '0.875rem',
        fontWeight: '500',
    },
    claimButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 16px',
        backgroundColor: '#2563eb',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '0.875rem',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    },
    howItWorksCard: {
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
    },
    howItWorksTitle: {
        fontSize: '1.25rem',
        fontWeight: '600',
        color: '#1f2937',
        margin: '0 0 24px 0',
        textAlign: 'center',
    },
    stepsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    step: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '16px',
    },
    stepNumber: {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        backgroundColor: '#2563eb',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.875rem',
        fontWeight: 'bold',
        flexShrink: 0,
    },
    stepContent: {
        flex: 1,
    },
    stepTitle: {
        fontSize: '1rem',
        fontWeight: '600',
        color: '#1f2937',
        margin: '0 0 8px 0',
    },
    stepDescription: {
        color: '#6b7280',
        lineHeight: '1.5',
        margin: 0,
    },
    unauthenticatedCard: {
        maxWidth: '400px',
        margin: '0 auto',
        padding: '48px 32px',
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        marginTop: '80px',
    },
    unauthenticatedTitle: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: '#1f2937',
        margin: '24px 0 16px 0',
    },
    unauthenticatedText: {
        color: '#6b7280',
        lineHeight: '1.6',
        margin: 0,
    },
};

// Add responsive styles and hover effects
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  .claim-button:hover:not(:disabled) {
    background-color: #1d4ed8 !important;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
  }
  
  .claim-button:disabled {
    cursor: not-allowed;
  }
  
  .contract-link:hover {
    text-decoration: underline !important;
  }
  
  .tx-link:hover {
    text-decoration: underline !important;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @media (max-width: 768px) {
    .image-card {
      flex-direction: column !important;
      align-items: flex-start !important;
      gap: 16px !important;
    }
    
    .reward-section {
      align-self: stretch !important;
    }
    
    .claim-button {
      width: 100% !important;
      justify-content: center !important;
    }
    
    .balance-section {
      grid-template-columns: 1fr !important;
    }
    
    .title-section {
      flex-direction: column !important;
      text-align: center !important;
    }
    
    .steps-list {
      gap: 24px !important;
    }
    
    .step {
      flex-direction: column !important;
      text-align: center !important;
      align-items: center !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default RewardsPage;