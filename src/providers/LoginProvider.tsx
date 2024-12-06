'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import toast from 'react-hot-toast'
import { CHAIN_NAMESPACES, IProvider, WEB3AUTH_NETWORK } from "@web3auth/base"
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider"
import { Web3Auth } from "@web3auth/modal"
import { ethers } from 'ethers'

interface LoginContextType {
    loading: boolean
    error: Error | null
    address: string | null
    provider: IProvider | null
    login: () => Promise<void>
    logout: () => Promise<void>
}

const LoginContext = createContext<LoginContextType>({
    loading: false,
    error: null,
    address: null,
    provider: null,
    login: async () => { },
    logout: async () => { },
})

// Web3Auth configuration
const chainConfig = {
    chainNamespace: CHAIN_NAMESPACES.EIP155,
    chainId: "0xaa36a7", // Sepolia
    rpcTarget: "https://rpc.ankr.com/eth_sepolia",
    displayName: "Ethereum Sepolia",
    blockExplorerUrl: "https://sepolia.etherscan.io",
    ticker: "ETH",
    tickerName: "Ethereum",
}

// Initialize Web3Auth outside component to prevent re-creation
const web3auth = new Web3Auth({
    clientId: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID!,
    web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_MAINNET,
    chainConfig,
    privateKeyProvider: new EthereumPrivateKeyProvider({ config: { chainConfig } })
})

export function LoginProvider({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)
    const [address, setAddress] = useState<string | null>(null)
    const [provider, setProvider] = useState<IProvider | null>(null)
    const { setAuth } = useAuthStore()

    // Initialize Web3Auth once
    useEffect(() => {
        const init = async () => {
            try {
                await web3auth.initModal()

                if (web3auth.connected) {
                    const provider = web3auth.provider
                    setProvider(provider)
                    const ethersProvider = new ethers.providers.Web3Provider(provider as any)
                    const signer = ethersProvider.getSigner()
                    const address = await signer.getAddress()
                    setAddress(address)
                    setAuth(address)
                }
            } catch (error) {
                console.error("Error initializing Web3Auth:", error)
            }
        }

        init()
    }, [])

    const login = async () => {
        try {
            setLoading(true)
            const web3authProvider = await web3auth.connect()
            setProvider(web3authProvider)

            if (web3authProvider) {
                const ethersProvider = new ethers.providers.Web3Provider(web3authProvider as any)
                const signer = ethersProvider.getSigner()
                const userAddress = await signer.getAddress()

                setAddress(userAddress)
                setAuth(userAddress)
                toast.success('Successfully logged in!')
            }
        } catch (err) {
            console.error("Error in login:", err)
            setError(err instanceof Error ? err : new Error('Failed to login'))
            toast.error('Failed to login')
            throw err
        } finally {
            setLoading(false)
        }
    }

    const logout = async () => {
        try {
            setLoading(true)
            await web3auth.logout()
            setProvider(null)
            setAddress(null)
            useAuthStore.getState().logout()
        } catch (err) {
            console.error("Error in logout:", err)
            setError(err instanceof Error ? err : new Error('Failed to logout'))
            toast.error('Failed to logout')
        } finally {
            setLoading(false)
        }
    }

    return (
        <LoginContext.Provider value={{
            loading,
            error,
            address,
            provider,
            login,
            logout
        }}>
            {children}
        </LoginContext.Provider>
    )
}

export const useLogin = () => useContext(LoginContext) 