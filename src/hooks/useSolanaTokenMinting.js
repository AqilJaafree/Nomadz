import { useState, useEffect, useCallback } from 'react';
import { usePrivy, useSolanaWallets } from '@privy-io/react-auth';
import { 
    Connection, 
    PublicKey, 
    Keypair,
    Transaction,
    sendAndConfirmTransaction
} from '@solana/web3.js';
import {
    getOrCreateAssociatedTokenAccount,
    mintTo,
    getAccount,
    TOKEN_PROGRAM_ID,
} from '@solana/spl-token';

// Configuration
const SOLANA_RPC_URL = import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.devnet.solana.com';
const TOKEN_MINT_ADDRESS = import.meta.env.VITE_NOMAD_TOKEN_MINT;
const MINT_AUTHORITY_KEY = import.meta.env.VITE_MINT_AUTHORITY_PRIVATE_KEY;
const TOKEN_DECIMALS = 9;

export const useSolanaTokenMinting = () => {
    const { ready, authenticated } = usePrivy();
    const { wallets } = useSolanaWallets();
    
    const [connection, setConnection] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [balance, setBalance] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [transactionSignature, setTransactionSignature] = useState(null);
    const [mintAuthority, setMintAuthority] = useState(null);

    // Initialize Solana connection and mint authority
    useEffect(() => {
        const conn = new Connection(SOLANA_RPC_URL, 'confirmed');
        setConnection(conn);

        // Initialize mint authority (in production, this should be server-side)
        if (MINT_AUTHORITY_KEY) {
            try {
                const authorityKeypair = Keypair.fromSecretKey(
                    new Uint8Array(JSON.parse(MINT_AUTHORITY_KEY))
                );
                setMintAuthority(authorityKeypair);
                console.log('✅ Mint authority loaded:', authorityKeypair.publicKey.toString());
            } catch (err) {
                console.error('❌ Failed to load mint authority:', err);
                setError('Failed to initialize mint authority');
            }
        } else {
            setError('Mint authority private key not configured');
        }
    }, []);

    // Check wallet connection status
    useEffect(() => {
        if (ready && authenticated && wallets && wallets.length > 0) {
            setIsConnected(true);
            setError(null);
            fetchTokenBalance();
        } else {
            setIsConnected(false);
            setBalance(0);
        }
    }, [ready, authenticated, wallets]);

    // Get wallet instance
    const getWallet = useCallback(() => {
        if (!wallets || wallets.length === 0) {
            throw new Error('No Solana wallet connected');
        }
        return wallets[0];
    }, [wallets]);

    // Get user's actual token balance
    const fetchTokenBalance = useCallback(async () => {
        if (!connection || !isConnected || !TOKEN_MINT_ADDRESS) return;

        try {
            const wallet = getWallet();
            const walletPublicKey = new PublicKey(wallet.address);
            const mintPublicKey = new PublicKey(TOKEN_MINT_ADDRESS);

            // Get associated token account
            const tokenAccount = await getOrCreateAssociatedTokenAccount(
                connection,
                mintAuthority, // Using mint authority as payer (in production, use a different payer)
                mintPublicKey,
                walletPublicKey
            );

            const accountInfo = await getAccount(connection, tokenAccount.address);
            const tokenBalance = Number(accountInfo.amount) / Math.pow(10, TOKEN_DECIMALS);
            
            setBalance(tokenBalance);
            console.log('✅ Token balance fetched:', tokenBalance);
        } catch (err) {
            console.error('❌ Error fetching token balance:', err);
            // If account doesn't exist, balance is 0
            setBalance(0);
        }
    }, [connection, isConnected, getWallet, mintAuthority]);

    // Real SPL token minting
    const mintTokens = async (amount = 10) => {
        if (!connection || !isConnected || !mintAuthority || !TOKEN_MINT_ADDRESS) {
            setError('Wallet not connected or mint authority not available');
            return false;
        }

        setLoading(true);
        setError(null);
        setTransactionSignature(null);

        try {
            const wallet = getWallet();
            const userPublicKey = new PublicKey(wallet.address);
            const mintPublicKey = new PublicKey(TOKEN_MINT_ADDRESS);

            console.log('🔄 Starting token mint process...');
            console.log('User wallet:', userPublicKey.toString());
            console.log('Token mint:', mintPublicKey.toString());
            console.log('Amount to mint:', amount);

            // Get or create associated token account for the user
            const tokenAccount = await getOrCreateAssociatedTokenAccount(
                connection,
                mintAuthority, // Payer for account creation
                mintPublicKey,
                userPublicKey
            );

            console.log('✅ Token account:', tokenAccount.address.toString());

            // Mint tokens to user's account
            const mintAmount = amount * Math.pow(10, TOKEN_DECIMALS);
            const signature = await mintTo(
                connection,
                mintAuthority, // Payer for transaction
                mintPublicKey,
                tokenAccount.address,
                mintAuthority, // Mint authority
                mintAmount
            );

            console.log('✅ Tokens minted successfully!');
            console.log('Transaction signature:', signature);

            // Update state
            setTransactionSignature(signature);
            setBalance(prevBalance => prevBalance + amount);

            // Clear success message after 10 seconds
            setTimeout(() => {
                setTransactionSignature(null);
            }, 10000);

            return true;
        } catch (err) {
            console.error('❌ Error minting tokens:', err);
            setError(`Failed to mint tokens: ${err.message}`);
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Create a new NOMAD token mint (one-time setup)
    const createNomadToken = async () => {
        if (!connection || !mintAuthority) {
            throw new Error('Connection or authority not available');
        }

        try {
            console.log('🔄 Creating NOMAD token mint...');

            // Import createMint function
            const { createMint } = await import('@solana/spl-token');

            const mintPublicKey = await createMint(
                connection,
                mintAuthority, // Payer
                mintAuthority.publicKey, // Mint authority
                null, // Freeze authority (optional)
                TOKEN_DECIMALS // Decimals
            );

            console.log('✅ NOMAD token created:', mintPublicKey.toString());
            console.log('Add this to your .env file:');
            console.log(`VITE_NOMAD_TOKEN_MINT=${mintPublicKey.toString()}`);

            return mintPublicKey.toString();
        } catch (err) {
            console.error('❌ Error creating token:', err);
            throw err;
        }
    };

    // Generate mint authority keypair (one-time setup)
    const generateMintAuthority = () => {
        const keypair = Keypair.generate();
        console.log('✅ New mint authority generated:');
        console.log('Public Key:', keypair.publicKey.toString());
        console.log('Private Key (save securely):', JSON.stringify(Array.from(keypair.secretKey)));
        console.log('Add this to your .env file:');
        console.log(`VITE_MINT_AUTHORITY_PRIVATE_KEY=${JSON.stringify(Array.from(keypair.secretKey))}`);
        
        return {
            publicKey: keypair.publicKey.toString(),
            privateKey: Array.from(keypair.secretKey)
        };
    };

    // Clear error
    const clearError = () => setError(null);

    return {
        // State
        isConnected,
        balance,
        loading,
        error,
        transactionSignature,
        tokenMintAddress: TOKEN_MINT_ADDRESS,
        connection,

        // Actions
        mintTokens,
        fetchTokenBalance,
        clearError,

        // Setup functions (for initial configuration)
        createNomadToken,
        generateMintAuthority,

        // Utils
        getWallet,
    };
};
