import { createContext, useContext, ReactNode, useState } from 'react';
import { ethers } from 'ethers';
import { useWeb3Auth } from './Web3Provider';
import { MemeCoinABI } from '../abi/MemeCoin';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { getChainConfig } from '../utils/config';
import { MemeCoinFactoryABI } from '@/abi/MemeCoinFactory';

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
    transferFrom: (
        tokenAddress: string,
        from: string,
        to: string,
        value: number
    ) => Promise<boolean>;
    decimals: (
        tokenAddress: string
    ) => Promise<number>;
    totalSupply: (
        tokenAddress: string
    ) => Promise<string>;
    symbol: (
        tokenAddress: string
    ) => Promise<string>;
    approveTool: any;
    transferTool: any;
    balanceOfTool: any;
    mintTool: any;
    burnTool: any;
    getTokenInfoTool: any;
    transferFromTool: any;
    decimalsTool: any;
    getListOfMemeTokensTool: any;
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

            const _approve = await approve(tokenAddress, to, amount);
            if (!_approve) {
                throw new Error('Failed to approve token transfer');
            }

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

    const transferFrom = async (
        tokenAddress: string,
        from: string,
        to: string,
        value: number
    ) => {
        try {
            setIsLoading(true);
            setError(null);

            const contract = getContract(tokenAddress);
            const tx = await contract.transferFrom(from, to, value);
            const receipt = await tx.wait();

            return receipt.status === 1;
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const decimals = async (tokenAddress: string) => {
        try {
            const contract = getContract(tokenAddress);
            const result = await contract.decimals();
            return result;
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const totalSupply = async (tokenAddress: string) => {
        try {
            const contract = getContract(tokenAddress);
            const supply = await contract.totalSupply();
            return supply.toString();
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const symbol = async (tokenAddress: string) => {
        try {
            const contract = getContract(tokenAddress);
            return await contract.symbol();
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const getListOfMemeTokens = async () => {
        if (!provider) {
            throw new Error('Provider not initialized');
        }
        console.log("getListOfMemeTokens", getChainConfig().MEME_FACTORY_ADDRESS)
        const ethersProvider = new ethers.providers.Web3Provider(provider);
        const signer = ethersProvider.getSigner();
        const contract = new ethers.Contract(getChainConfig().MEME_FACTORY_ADDRESS, MemeCoinFactoryABI, signer);
        const results = await contract.allMemeCoinTokens();
        console.log("results", results)
        return results;
    };

    const getListOfMemeTokensTool = tool(
        async () => {
            return await getListOfMemeTokens();
        },
        {
            name: 'getListOfMemeTokens',
            description: 'Get the list of all meme tokens',
        }
    );


    const approveTool = tool(
        async ({ tokenAddress, spender, amount }: { tokenAddress: string; spender: string; amount: number }) => {
            return await approve(tokenAddress, spender, amount);
        },
        {
            name: 'approveToken',
            description: 'Approve spending of tokens by another address',
            schema: z.object({
                tokenAddress: z.string().describe('The address of the token contract'),
                spender: z.string().describe('The address allowed to spend tokens'),
                amount: z.number().describe('The amount of tokens to approve'),
            }),
        }
    );

    const transferTool = tool(
        async ({ tokenAddress, to, amount }: { tokenAddress: string; to: string; amount: number }) => {
            return await transfer(tokenAddress, to, amount);
        },
        {
            name: 'transferToken',
            description: 'Transfer tokens to another address',
            schema: z.object({
                tokenAddress: z.string().describe('The address of the token contract'),
                to: z.string().describe('The recipient address'),
                amount: z.number().describe('The amount of tokens to transfer'),
            }),
        }
    );

    const balanceOfTool = tool(
        async ({ tokenAddress, account }: { tokenAddress: string; account: string }) => {
            return await balanceOf(tokenAddress, account);
        },
        {
            name: 'getTokenBalance',
            description: 'Get token balance of an address',
            schema: z.object({
                tokenAddress: z.string().describe('The address of the token contract'),
                account: z.string().describe('The address to check balance for'),
            }),
        }
    );

    const mintTool = tool(
        async ({ tokenAddress, amount }: { tokenAddress: string; amount: number }) => {
            return await mint(tokenAddress, amount);
        },
        {
            name: 'mintToken',
            description: 'Mint new tokens (requires authorization)',
            schema: z.object({
                tokenAddress: z.string().describe('The address of the token contract'),
                amount: z.number().describe('The amount of tokens to mint'),
            }),
        }
    );

    const burnTool = tool(
        async ({ tokenAddress, amount }: { tokenAddress: string; amount: number }) => {
            return await burn(tokenAddress, amount);
        },
        {
            name: 'burnToken',
            description: 'Burn existing tokens',
            schema: z.object({
                tokenAddress: z.string().describe('The address of the token contract'),
                amount: z.number().describe('The amount of tokens to burn'),
            }),
        }
    );

    const getTokenInfoTool = tool(
        async ({ tokenAddress }: { tokenAddress: string }) => {
            return await getTokenInfo(tokenAddress);
        },
        {
            name: 'getTokenInfo',
            description: 'Get comprehensive token information including name, symbol, decimals, and supply',
            schema: z.object({
                tokenAddress: z.string().describe('The address of the token contract'),
            }),
        }
    );

    const transferFromTool = tool(
        async ({ tokenAddress, from, to, value }: { tokenAddress: string; from: string; to: string; value: number }) => {
            return await transferFrom(tokenAddress, from, to, value);
        },
        {
            name: 'transferFromToken',
            description: 'Transfer tokens from one address to another (requires approval)',
            schema: z.object({
                tokenAddress: z.string().describe('The address of the token contract'),
                from: z.string().describe('The address to transfer from'),
                to: z.string().describe('The recipient address'),
                value: z.number().describe('The amount of tokens to transfer'),
            }),
        }
    );

    const decimalsTool = tool(
        async ({ tokenAddress }: { tokenAddress: string }) => {
            return await decimals(tokenAddress);
        },
        {
            name: 'getTokenDecimals',
            description: 'Get the number of decimals for the token',
            schema: z.object({
                tokenAddress: z.string().describe('The address of the token contract'),
            }),
        }
    );

    const totalSupplyTool = tool(
        async ({ tokenAddress }: { tokenAddress: string }) => {
            return await totalSupply(tokenAddress);
        },
        {
            name: 'getTokenTotalSupply',
            description: 'Get the total supply of the token',
            schema: z.object({
                tokenAddress: z.string().describe('The address of the token contract'),
            }),
        }
    );

    const symbolTool = tool(
        async ({ tokenAddress }: { tokenAddress: string }) => {
            return await symbol(tokenAddress);
        },
        {
            name: 'getTokenSymbol',
            description: 'Get the symbol of the token',
            schema: z.object({
                tokenAddress: z.string().describe('The address of the token contract'),
            }),
        }
    );


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
        transferFrom,
        decimals,
        totalSupply,
        symbol,
        approveTool,
        transferTool,
        balanceOfTool,
        mintTool,
        burnTool,
        getTokenInfoTool,
        transferFromTool,
        decimalsTool,
        getListOfMemeTokensTool,
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