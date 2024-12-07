import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useWeb3Auth } from './Web3Provider';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';

// Define the type for our meme coin data
interface MemeCoin {
    totalSupply: string;
    name: string;
    symbol: string;
    decimals: number;
    initialSupply: string;
}

interface ContractsDataContextType {
    memeCoins: any | null;
    loading: boolean;
    error: Error | null;
    fetchMemeCoinsDataTool: any;
}

const ContractsDataContext = createContext<ContractsDataContextType>({
    memeCoins: null,
    loading: false,
    error: null,
    fetchMemeCoinsDataTool: null
});

const GRAPH_ENDPOINT = 'https://api.studio.thegraph.com/query/43740/meme-agent-base-sepolia/version/latest';

const fetchMemeCoinsData = async (address: string): Promise<MemeCoin> => {
    const response = await axios.post(GRAPH_ENDPOINT, {
        query: `
            query MemeTokenOwnersQuery {
              memeCoins(where: {creator: "${address}"}) {
                id
                totalSupply
                name
                symbol
                decimals
                initialSupply
              }
            }
        `
    });
    return response.data.data;
};

export const GraphDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [memeCoins, setMemeCoins] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const { address } = useWeb3Auth();

    useEffect(() => {
        if (!address) return;
        const loadData = async () => {
            try {
                const data = await fetchMemeCoinsData(address);
                setMemeCoins(data);
            } catch (err) {
                setError(err as Error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [address]);

    const fetchMemeCoinsDataTool = tool(
        async () => {
            if (!address) {
                return [];
            }
            return await fetchMemeCoinsData(address);
        },
        {
            name: 'fetchMemeCoinsData',
            description: 'Fetch all meme coins information created by the user from The Graph'
        }
    );

    return (
        <ContractsDataContext.Provider value={{
            memeCoins,
            loading,
            error,
            fetchMemeCoinsDataTool
        }}>
            {children}
        </ContractsDataContext.Provider>
    );
};

// Custom hook to use the contracts data
export const useGraphData = () => {
    const context = useContext(ContractsDataContext);
    if (!context) {
        throw new Error('useGraphData must be used within a GraphDataProvider');
    }
    return context;
};
