import { createContext, useContext, ReactNode, useState } from 'react';
import { ethers } from 'ethers';
import { useWeb3Auth } from './Web3Provider';
import { MemeCoinABI } from '../abi/MemeCoin';

interface MemeTokenContextType {
    approve: (
        tokenAddress: string,
        spender: string,
        amount: number
    ) => Promise<boolean>;
    transfer: (
        tokenAddress: string,
        to: string,
        amount: number
    ) => Promise<boolean>;
    balanceOf: (
        tokenAddress: string,
        account: string
    ) => Promise<string>;
    allowance: (
        tokenAddress: string,
        owner: string,
        spender: string
    ) => Promise<string>;
    mint: (
        tokenAddress: string,
        amount: number
    ) => Promise<void>;
    burn: (
        tokenAddress: string,
        amount: number
    ) => Promise<void>;
    getTokenInfo: (
        tokenAddress: string
    ) => Promise<{
        name: string;
        symbol: string;
        decimals: number;
        totalSupply: string;
        maxSupply: string;
    }>;
    isLoading: boolean;
    error: string | null;
}

const MemeTokenContext = createContext<MemeTokenContextType | null>(null);

export function MemeTokenProvider({ children }: { children: ReactNode }) {
    const { provider } = useWeb3Auth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getContract = (tokenAddress: string) => {
        if (!provider) {
            throw new Error('Provider not initialized');
        }
        const ethersProvider = new ethers.providers.Web3Provider(provider);
        const signer = ethersProvider.getSigner();
        return new ethers.Contract(tokenAddress, MemeCoinABI, signer);
    };

    const approve = async (tokenAddress: string, spender: string, amount: number) => {
        try {
            setIsLoading(true);
            setError(null);

            const contract = getContract(tokenAddress);
            const tx = await contract.approve(spender, amount);
            const receipt = await tx.wait();

            return receipt.status === 1;
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const transfer = async (tokenAddress: string, to: string, amount: number) => {
        try {
            setIsLoading(true);
            setError(null);

            const contract = getContract(tokenAddress);
            const tx = await contract.transfer(to, amount);
            const receipt = await tx.wait();

            return receipt.status === 1;
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const balanceOf = async (tokenAddress: string, account: string) => {
        try {
            const contract = getContract(tokenAddress);
            const balance = await contract.balanceOf(account);
            return balance.toString();
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const allowance = async (tokenAddress: string, owner: string, spender: string) => {
        try {
            const contract = getContract(tokenAddress);
            const amount = await contract.allowance(owner, spender);
            return amount.toString();
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const mint = async (tokenAddress: string, amount: number) => {
        try {
            setIsLoading(true);
            setError(null);

            const contract = getContract(tokenAddress);
            const tx = await contract.mint(amount);
            await tx.wait();
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const burn = async (tokenAddress: string, amount: number) => {
        try {
            setIsLoading(true);
            setError(null);

            const contract = getContract(tokenAddress);
            const tx = await contract.burn(amount);
            await tx.wait();
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const getTokenInfo = async (tokenAddress: string) => {
        try {
            const contract = getContract(tokenAddress);
            const [name, symbol, decimals, totalSupply, maxSupply] = await Promise.all([
                contract.name(),
                contract.symbol(),
                contract.decimals(),
                contract.totalSupply(),
                contract.maxSupply(),
            ]);

            return {
                name,
                symbol,
                decimals,
                totalSupply: totalSupply.toString(),
                maxSupply: maxSupply.toString(),
            };
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const value = {
        approve,
        transfer,
        balanceOf,
        allowance,
        mint,
        burn,
        getTokenInfo,
        isLoading,
        error,
    };

    return (
        <MemeTokenContext.Provider value={value}>
            {children}
        </MemeTokenContext.Provider>
    );
}

export function useMemeToken() {
    const context = useContext(MemeTokenContext);
    if (!context) {
        throw new Error('useMemeToken must be used within a MemeTokenProvider');
    }
    return context;
}