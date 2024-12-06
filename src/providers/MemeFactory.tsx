import { createContext, useContext, ReactNode, useState } from 'react';
import { ethers } from 'ethers';
import { useWeb3Auth } from './Web3Provider';
import { MemeCoinFactoryABI } from '../abi/MemeCoinFactory';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';

const MEME_FACTORY_ADDRESS = '0x0C58c60263949b7bDb0ae49081e6DD629df69459';

interface MemeFactoryContextType {
    createMemeCoin: (
        name: string,
        symbol: string,
        maxSupply: number,
        initialMint: number,
        usdtAmount: number
    ) => Promise<string>;
    createMemeCointTool: any;
    isLoading: boolean;
    error: string | null;
}

const MemeFactoryContext = createContext<MemeFactoryContextType | null>(null);

export function MemeFactoryProvider({ children }: { children: ReactNode }) {
    const { provider } = useWeb3Auth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createMemeCoin = async (
        name: string,
        symbol: string,
        maxSupply: number,
        initialMint: number,
        usdtAmount: number
    ) => {
        try {
            console.log("calling meme creation")
            setIsLoading(true);
            setError(null);

            if (!provider) {
                throw new Error('Provider not initialized');
            }

            const ethersProvider = new ethers.providers.Web3Provider(provider);
            const signer = ethersProvider.getSigner();
            const memeFactory = new ethers.Contract(
                MEME_FACTORY_ADDRESS,
                MemeCoinFactoryABI,
                signer
            );

            const tx = await memeFactory.createMemeCoin(
                name,
                symbol,
                ethers.utils.parseEther(maxSupply.toString()),
                ethers.utils.parseEther(initialMint.toString()),
                ethers.utils.parseEther(usdtAmount.toString())
            );
            const receipt = await tx.wait();

            const event = receipt.events?.find(
                (event: any) => event.event === 'MemeCoinCreated'
            );
            const memeCoinAddress = event?.args?.memeCoin;

            return memeCoinAddress || receipt.transactionHash;
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const createMemeCointTool = tool(
        async ({ name, symbol, maxSupply, initialMint, usdtAmount }: { name: string, symbol: string, maxSupply: number, initialMint: number, usdtAmount: number }) => {
            return await createMemeCoin(name, symbol, maxSupply, initialMint, usdtAmount);
        },
        {
            name: 'createMemeCoin',
            description: 'Create a new meme coin with the given parameters',
            schema: z.object({
                name: z.string().describe('The name of the meme coin can be a string of up to 32 characters'),
                symbol: z.string().describe('The symbol of the meme coin can be a string of up to 8 characters'),
                maxSupply: z.number().describe('The maximum supply of the meme coin, should be a number'),
                initialMint: z.number().describe('The initial mint amount of the meme coin, should be a number'),
                usdtAmount: z.number().describe('The amount of USDT to be used for the initial mint, should be a number'),
            }),
        }
    );

    return (
        <MemeFactoryContext.Provider value={{
            createMemeCoin,
            createMemeCointTool,
            isLoading,
            error,
        }}>
            {children}
        </MemeFactoryContext.Provider>
    );
}

export function useMemeFactory() {
    const context = useContext(MemeFactoryContext);
    if (!context) {
        throw new Error('useMemeFactory must be used within a MemeFactoryProvider');
    }
    return context;
}