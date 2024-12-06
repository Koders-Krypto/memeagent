import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useWeb3Auth } from './Web3Provider';

// Define the type for our meme coin data
interface MemeCoin {
    totalSupply: string;
    name: string;
    symbol: string;
    decimals: number;
    initialSupply: string;
}

interface ContractsDataContextType {
    memeCoins: MemeCoin[];
    loading: boolean;
    error: Error | null;
}

const ContractsDataContext = createContext<ContractsDataContextType>({
    memeCoins: [],
    loading: false,
    error: null,
});

const GRAPH_ENDPOINT = 'https://api.studio.thegraph.com/query/43740/meme-agent-base-sepolia/version/latest';

export const ContractsDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [memeCoins, setMemeCoins] = useState<MemeCoin[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const { address } = useWeb3Auth();

    useEffect(() => {
        if (!address) return;
        const fetchData = async () => {
            try {
                const response = await axios.post(GRAPH_ENDPOINT, {
                    query: `
            query MemeTokenOwnersQuery {
              memeCoins(where: {creator: "${address}"}) {
                totalSupply
                name
                symbol
                decimals
                initialSupply
              }
            }
          `
                });
                setMemeCoins(response.data.data.memeCoins);
            } catch (err) {
                setError(err as Error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [address]);

    return (
        <ContractsDataContext.Provider value={{ memeCoins, loading, error }}>
            {children}
        </ContractsDataContext.Provider>
    );
};

// Custom hook to use the contracts data
export const useContractsData = () => {
    const context = useContext(ContractsDataContext);
    if (!context) {
        throw new Error('useContractsData must be used within a ContractsDataProvider');
    }
    return context;
};
