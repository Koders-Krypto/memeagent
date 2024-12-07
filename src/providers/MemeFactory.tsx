import { createContext, useContext, ReactNode, useState } from 'react';
import { ethers } from 'ethers';
import { useWeb3Auth } from './Web3Provider';
import { MemeCoinFactoryABI } from '../abi/MemeCoinFactory';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { MockUSDTABI } from '@/abi/MockUSDT';
import { getChainConfig } from '@/utils/config';

const MEME_FACTORY_ADDRESS = getChainConfig().MEME_FACTORY_ADDRESS;

interface MemeFactoryContextType {
    createMemeCoin: (
        name: string,
        symbol: string,
        maxSupply: number,
        initialMint: number,
        usdtAmount: number
    ) => Promise<string>;
    getMemeCoinCount: () => Promise<string>;
    getMemeCoinCreator: (memeCoin: string) => Promise<string>;
    getUsdtTokenAddress: () => Promise<string>;
    getLiquidityFactoryAddress: () => Promise<string>;
    getMemeCoinAddressTool: (name: string, symbol: string, maxSupply: number, initialMint: number, usdtAmount: number) => Promise<string | undefined>;
    createMemeCointTool: any;
    getMemeCoinCountTool: any;
    getMemeCoinCreatorTool: any;
    getUsdtTokenAddressTool: any;
    getLiquidityFactoryAddressTool: any;
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
            setIsLoading(true);
            setError(null);

            if (!provider) {
                throw new Error('Provider not initialized');
            }

            try {


                const ethersProvider = new ethers.providers.Web3Provider(provider);
                const signer = ethersProvider.getSigner();

                const approveContract = new ethers.Contract(
                    getChainConfig().USDT_ADDRESS,
                    MockUSDTABI,
                    signer
                )

                const approveTx = await approveContract.approve(
                    MEME_FACTORY_ADDRESS,
                    ethers.utils.parseEther(usdtAmount.toString())
                )

                const approveReceipt = await approveTx.wait();

                const memeFactory = new ethers.Contract(
                    MEME_FACTORY_ADDRESS,
                    MemeCoinFactoryABI,
                    signer
                );

                console.log("params", name,
                    symbol,
                    ethers.utils.parseEther(maxSupply.toString()),
                    ethers.utils.parseEther(initialMint.toString()),
                    ethers.utils.parseEther(usdtAmount.toString()))

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
            }
            catch (err: any) {
                return err.message;
            }
        } catch (err: any) {
            setError(err);
            return err;
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

    const getMemeCoinCount = async () => {
        try {
            if (!provider) {
                return new Error('Provider not initialized');
            }
            const ethersProvider = new ethers.providers.Web3Provider(provider);
            const memeFactory = new ethers.Contract(
                MEME_FACTORY_ADDRESS,
                MemeCoinFactoryABI,
                ethersProvider
            );
            return (await memeFactory.getMemeCoinCount()).toString();
        } catch (err: any) {
            return err;
        }
    };

    const getMemeCoinCreator = async (memeCoin: string) => {
        try {
            if (!provider) {
                return new Error('Provider not initialized');
            }
            const ethersProvider = new ethers.providers.Web3Provider(provider);
            const memeFactory = new ethers.Contract(
                MEME_FACTORY_ADDRESS,
                MemeCoinFactoryABI,
                ethersProvider
            );
            return await memeFactory.getMemeCoinCreator(memeCoin);
        } catch (err: any) {
            return err;
        }

    };

    const getUsdtTokenAddress = async () => {
        try {
            if (!provider) {
                return new Error('Provider not initialized');
            }
            const ethersProvider = new ethers.providers.Web3Provider(provider);
            const memeFactory = new ethers.Contract(
                MEME_FACTORY_ADDRESS,
                MemeCoinFactoryABI,
                ethersProvider
            );
            return await memeFactory.usdtToken();
        } catch (err: any) {
            return err;
        }
    };

    const getLiquidityFactoryAddress = async () => {
        try {
            if (!provider) {
                return new Error('Provider not initialized');
            }
            const ethersProvider = new ethers.providers.Web3Provider(provider);
            const memeFactory = new ethers.Contract(
                MEME_FACTORY_ADDRESS,
                MemeCoinFactoryABI,
                ethersProvider
            );
            return await memeFactory.liquidityFactory();
        } catch (err: any) {
            return err;
        }
    };

    const getMemeCoinCountTool = tool(
        async () => {
            return await getMemeCoinCount();
        },
        {
            name: 'getMemeCoinCount',
            description: 'Get the total number of meme coins created',
            schema: z.object({}),
        }
    );

    const getMemeCoinCreatorTool = tool(
        async ({ memeCoin }: { memeCoin: string }) => {
            return await getMemeCoinCreator(memeCoin);
        },
        {
            name: 'getMemeCoinCreator',
            description: 'Get the creator address for a specific meme coin',
            schema: z.object({
                memeCoin: z.string().describe('The address of the meme coin contract'),
            }),
        }
    );

    const getUsdtTokenAddressTool = tool(
        async () => {
            return await getUsdtTokenAddress();
        },
        {
            name: 'getUsdtTokenAddress',
            description: 'Get the USDT token address used by the factory',
            schema: z.object({}),
        }
    );

    const getLiquidityFactoryAddressTool = tool(
        async () => {
            return await getLiquidityFactoryAddress();
        },
        {
            name: 'getLiquidityFactoryAddress',
            description: 'Get the liquidity factory address used by the contract',
            schema: z.object({}),
        }
    );

    const getMemeCoinAddressTool = async (name: string, symbol: string, maxSupply: number, initialMint: number, usdtAmount: number) => {
        if (!provider) {
            return "provider not initialized"
        }
        const ethersProvider = new ethers.providers.Web3Provider(provider);
        const signer = ethersProvider.getSigner();
        const memeFactorycontract = new ethers.Contract(getChainConfig().MEME_FACTORY_ADDRESS, MemeCoinFactoryABI, signer);
        const staticResults = await memeFactorycontract.callStatic.createMeme(
            name,
            symbol,
            ethers.utils.parseEther(maxSupply.toString()),
            ethers.utils.parseEther(initialMint.toString()),
            ethers.utils.parseEther(usdtAmount.toString())
        )
        console.log("static results", staticResults);
    }

    return (
        <MemeFactoryContext.Provider value={{
            createMemeCoin,
            getMemeCoinCount,
            getMemeCoinCreator,
            getUsdtTokenAddress,
            getLiquidityFactoryAddress,
            getMemeCoinAddressTool,
            createMemeCointTool,
            getMemeCoinCountTool,
            getMemeCoinCreatorTool,
            getUsdtTokenAddressTool,
            getLiquidityFactoryAddressTool,
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