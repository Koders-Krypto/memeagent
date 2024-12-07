import { createContext, useContext, ReactNode, useState } from 'react';
import { ethers } from 'ethers';
import { useWeb3Auth } from './Web3Provider';
import { LiquidityFactoryABI } from '../abi/LiquidityFactory';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { getChainConfig } from '@/utils/config';

interface LiquidityFactoryContextType {
    createPair: (tokenA: string, tokenB: string) => Promise<string>;
    getPair: (tokenA: string, tokenB: string) => Promise<string>;
    getAllPairs: () => Promise<string[]>;
    isLoading: boolean;
    error: string | null;
    createPairTool: any;
    getPairTool: any;
    getAllPairsTool: any;
}

const LiquidityFactoryContext = createContext<LiquidityFactoryContextType | null>(null);

export function LiquidityFactoryProvider({ children }: { children: ReactNode }) {
    const { provider } = useWeb3Auth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getContract = () => {
        try {
            if (!provider) {
                return new Error('Provider not initialized');
            }
            const ethersProvider = new ethers.providers.Web3Provider(provider);
            const signer = ethersProvider.getSigner();
            return new ethers.Contract(
                getChainConfig().LIQUIDITY_FACTORY_ADDRESS,
                LiquidityFactoryABI,
                signer
            );
        } catch (err: any) {
            return err;
        }
    };

    const createPair = async (tokenA: string, tokenB: string) => {
        try {
            setIsLoading(true);
            setError(null);

            const contract = getContract();
            const tx = await contract.createPair(tokenA, tokenB);
            const receipt = await tx.wait();

            const event = receipt.events?.find(
                (event: any) => event.event === 'PairCreated'
            );

            return event?.args?.pair || '';
        } catch (err: any) {
            setError(err.message);
            return err;
        } finally {
            setIsLoading(false);
        }
    };

    const getPair = async (tokenA: string) => {
        try {
            const contract = getContract();
            const pairAddress = await contract.getPair(tokenA, getChainConfig().USDT_ADDRESS);
            return pairAddress;
        } catch (err: any) {
            console.log("getPair", err)
            setError(err.message);
            return err;
        }
    };

    const getAllPairs = async () => {
        try {
            const contract = getContract();
            const length = await contract.allPairsLength();
            const pairs = [];

            for (let i = 0; i < length; i++) {
                const pairAddress = await contract.allPairs(i);
                pairs.push(pairAddress);
            }

            return pairs;
        } catch (err: any) {
            setError(err.message);
            return err;
        }
    };

    const createPairTool = tool(
        async ({ tokenA, tokenB }: { tokenA: string; tokenB: string }) => {
            return await createPair(tokenA, tokenB);
        },
        {
            name: 'createPair',
            description: 'Create a new liquidity pair for two tokens',
            schema: z.object({
                tokenA: z.string().describe('The address of the first token'),
                tokenB: z.string().describe('The address of the second token'),
            }),
        }
    );

    const getPairTool = tool(
        async ({ tokenA }: { tokenA: string }) => {
            console.log("getPairTool", tokenA)
            return await getPair(tokenA);
        },
        {
            name: 'getPair',
            description: 'Get the address of an existing liquidity pair',
            schema: z.object({
                tokenA: z.string().describe('The smart contract address of the meme token'),
            }),
        }
    );

    const getAllPairsTool = tool(
        async () => {
            return await getAllPairs();
        },
        {
            name: 'getAllPairs',
            description: 'Get all existing liquidity pairs',
            schema: z.object({}),
        }
    );

    const value = {
        createPair,
        getPair,
        getAllPairs,
        isLoading,
        error,
        createPairTool,
        getPairTool,
        getAllPairsTool,
    };

    return (
        <LiquidityFactoryContext.Provider value={value}>
            {children}
        </LiquidityFactoryContext.Provider>
    );
}

// Custom hook to use the LiquidityFactory context
export function useLiquidityFactory() {
    const context = useContext(LiquidityFactoryContext);
    if (!context) {
        throw new Error('useLiquidityFactory must be used within a LiquidityFactoryProvider');
    }
    return context;
}
