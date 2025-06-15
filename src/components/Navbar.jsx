// src/components/Navbar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { usePrivy } from '@privy-io/react-auth';
import { Luggage, Coins, Wallet, LogOut, User } from 'lucide-react';

const Navbar = () => {
    const location = useLocation();
    const { ready, authenticated, user, login, logout } = usePrivy();

    const isActive = (path) => location.pathname === path;

    return (
        <nav style={styles.navbar}>
            <div style={styles.navContainer}>
                {/* Logo and Brand */}
                <Link to="/" style={styles.brand}>
                    <Luggage size={32} color="#2563eb" />
                    <span style={styles.brandText}>Nomadz</span>
                </Link>

                {/* Navigation Links */}
                <div style={styles.navLinks}>
                    <Link 
                        to="/" 
                        style={{
                            ...styles.navLink,
                            ...(isActive('/') ? styles.activeLink : {})
                        }}
                    >
                        <Luggage size={18} />
                        <span>Estimate</span>
                    </Link>
                    
                    <Link 
                        to="/rewards" 
                        style={{
                            ...styles.navLink,
                            ...(isActive('/rewards') ? styles.activeLink : {})
                        }}
                    >
                        <Coins size={18} />
                        <span>Rewards</span>
                    </Link>
                </div>

                {/* Wallet Connection */}
                <div style={styles.walletSection}>
                    {ready && authenticated ? (
                        <div style={styles.userInfo}>
                            <div style={styles.userDetails}>
                                <div style={styles.userAvatar}>
                                    <User size={16} />
                                </div>
                                <div style={styles.userText}>
                                    <div style={styles.userName}>
                                        {user?.wallet?.address 
                                            ? `${user.wallet.address.slice(0, 4)}...${user.wallet.address.slice(-4)}`
                                            : user?.email?.address || 'Connected'
                                        }
                                    </div>
                                    <div style={styles.userStatus}>Connected</div>
                                </div>
                            </div>
                            <button
                                onClick={logout}
                                style={styles.logoutButton}
                                title="Disconnect Wallet"
                            >
                                <LogOut size={16} />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={login}
                            style={styles.connectButton}
                            disabled={!ready}
                        >
                            <Wallet size={18} />
                            <span>{ready ? 'Connect Wallet' : 'Loading...'}</span>
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
};

const styles = {
    navbar: {
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
    },
    navContainer: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '70px',
    },
    brand: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        textDecoration: 'none',
        fontWeight: 'bold',
        fontSize: '1.5rem',
        color: '#1f2937',
    },
    brandText: {
        background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
    },
    navLinks: {
        display: 'flex',
        gap: '24px',
    },
    navLink: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        borderRadius: '8px',
        textDecoration: 'none',
        color: '#6b7280',
        fontWeight: '500',
        fontSize: '0.95rem',
        transition: 'all 0.2s ease',
    },
    activeLink: {
        backgroundColor: '#dbeafe',
        color: '#2563eb',
    },
    walletSection: {
        display: 'flex',
        alignItems: 'center',
    },
    userInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '8px 12px',
        backgroundColor: '#f9fafb',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
    },
    userDetails: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    userAvatar: {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        backgroundColor: '#2563eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
    },
    userText: {
        display: 'flex',
        flexDirection: 'column',
    },
    userName: {
        fontSize: '0.875rem',
        fontWeight: '600',
        color: '#1f2937',
        lineHeight: '1.2',
    },
    userStatus: {
        fontSize: '0.75rem',
        color: '#16a34a',
        lineHeight: '1.2',
    },
    logoutButton: {
        padding: '6px',
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: '6px',
        color: '#6b7280',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease',
    },
    connectButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 20px',
        backgroundColor: '#2563eb',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '0.95rem',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    },
};

// Add hover effects
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  .nav-link:hover {
    background-color: #f3f4f6 !important;
    color: #374151 !important;
  }
  
  .connect-button:hover {
    background-color: #1d4ed8 !important;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
  }
  
  .connect-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  .connect-button:disabled:hover {
    transform: none;
    box-shadow: none;
  }
  
  .logout-button:hover {
    background-color: #f3f4f6 !important;
    color: #ef4444 !important;
  }
  
  @media (max-width: 768px) {
    .nav-links {
      gap: 16px !important;
    }
    
    .nav-link span {
      display: none !important;
    }
    
    .user-text {
      display: none !important;
    }
    
    .brand-text {
      display: none !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default Navbar;