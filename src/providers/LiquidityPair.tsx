import { createContext, useContext, ReactNode, useState } from 'react';
import { ethers } from 'ethers';
import { useWeb3Auth } from './Web3Provider';
import { LiquidityPairABI } from '../abi/LiquidityPair';

interface LiquidityPairContextType {
    addLiquidity: (
        pairAddress: string,
        amount0Desired: number,
        amount1Desired: number,
        amount0Min: number,
        amount1Min: number
    ) => Promise<string>;
    removeLiquidity: (
        pairAddress: string,
        liquidity: number
    ) => Promise<{ amount0: string; amount1: string }>;
    swap: (
        pairAddress: string,
        amount0Out: number,
        amount1Out: number,
        to: string
    ) => Promise<string>;
    getReserves: (
        pairAddress: string
    ) => Promise<{ reserve0: string; reserve1: string }>;
    checkAllowance: (
        pairAddress: string,
        owner: string
    ) => Promise<{ token0Allowance: string; token1Allowance: string }>;
    isLoading: boolean;
    error: string | null;
}

const LiquidityPairContext = createContext<LiquidityPairContextType | null>(null);

export function LiquidityPairProvider({ children }: { children: ReactNode }) {
    const { provider } = useWeb3Auth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getContract = (pairAddress: string) => {
        if (!provider) {
            throw new Error('Provider not initialized');
        }
        const ethersProvider = new ethers.providers.Web3Provider(provider);
        const signer = ethersProvider.getSigner();
        return new ethers.Contract(pairAddress, LiquidityPairABI, signer);
    };

    const addLiquidity = async (
        pairAddress: string,
        amount0Desired: number,
        amount1Desired: number,
        amount0Min: number,
        amount1Min: number
    ) => {
        try {
            setIsLoading(true);
            setError(null);

            const contract = getContract(pairAddress);
            const tx = await contract.addLiquidity(
                amount0Desired,
                amount1Desired,
                amount0Min,
                amount1Min
            );
            const receipt = await tx.wait();

            const event = receipt.events?.find(
                (event: any) => event.event === 'Mint'
            );

            return receipt.transactionHash;
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const removeLiquidity = async (pairAddress: string, liquidity: number) => {
        try {
            setIsLoading(true);
            setError(null);

            const contract = getContract(pairAddress);
            const tx = await contract.removeLiquidity(liquidity);
            const receipt = await tx.wait();

            const event = receipt.events?.find(
                (event: any) => event.event === 'Burn'
            );

            return {
                amount0: event?.args?.amount0.toString() || '0',
                amount1: event?.args?.amount1.toString() || '0',
            };
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const swap = async (
        pairAddress: string,
        amount0Out: number,
        amount1Out: number,
        to: string
    ) => {
        try {
            setIsLoading(true);
            setError(null);

            const contract = getContract(pairAddress);
            const tx = await contract.swap(amount0Out, amount1Out, to);
            const receipt = await tx.wait();
            return receipt.transactionHash;
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const getReserves = async (pairAddress: string) => {
        try {
            const contract = getContract(pairAddress);
            const [reserve0, reserve1] = await contract.getReserves();
            return {
                reserve0: reserve0.toString(),
                reserve1: reserve1.toString(),
            };
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const checkAllowance = async (pairAddress: string, owner: string) => {
        try {
            const contract = getContract(pairAddress);
            const [token0Allowance, token1Allowance] = await contract.checkAllowance(owner);
            return {
                token0Allowance: token0Allowance.toString(),
                token1Allowance: token1Allowance.toString(),
            };
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const value = {
        addLiquidity,
        removeLiquidity,
        swap,
        getReserves,
        checkAllowance,
        isLoading,
        error,
    };

    return (
        <LiquidityPairContext.Provider value={value}>
            {children}
        </LiquidityPairContext.Provider>
    );
}

// Custom hook to use the LiquidityPair context
export function useLiquidityPair() {
    const context = useContext(LiquidityPairContext);
    if (!context) {
        throw new Error('useLiquidityPair must be used within a LiquidityPairProvider');
    }
    return context;
}
