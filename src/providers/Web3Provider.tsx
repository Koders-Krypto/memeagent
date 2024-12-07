'use client'

import React, { createContext, useContext, useState, useEffect } from "react"
import {
    CHAIN_NAMESPACES,
    IAdapter,
    IProvider,
    WEB3AUTH_NETWORK,
} from "@web3auth/base"
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider"
import { getDefaultExternalAdapters } from "@web3auth/default-evm-adapter"
import { Web3Auth, Web3AuthOptions } from "@web3auth/modal"
import RPC from "@/utils/ethersRPC"
import { useRouter } from "next/navigation"
import { useAuthStore } from '@/store/useAuthStore'
import toast from 'react-hot-toast'
import { tool } from "@langchain/core/tools"
import { ethers } from 'ethers'
import { MockUSDTABI } from '@/abi/MockUSDT'
import { getChainConfig } from "@/utils/config"

interface Web3ContextType {
    provider: IProvider | null
    web3auth: Web3Auth | null
    login: () => Promise<void>
    logout: () => Promise<void>
    getUserInfo: () => Promise<void>
    loggedIn: boolean
    address: string | null
    getBalance: () => Promise<string>
    getAccounts: () => Promise<string>
    getChainId: () => Promise<number>
    getBalanceTool: any
    usdBalance: string
    getUsdBalance: () => Promise<void>
}

const Web3Context = createContext<Web3ContextType | null>(null)

export const useWeb3Auth = () => {
    const context = useContext(Web3Context)
    if (!context) {
        throw new Error("useWeb3Auth must be used within a Web3Provider")
    }
    return context
}

export function Web3Provider({ children }: { children: React.ReactNode }) {
    const [provider, setProvider] = useState<IProvider | null>(null)
    const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null)
    const [loggedIn, setLoggedIn] = useState(false)
    const [address, setAddress] = useState<string | null>(null)
    const { setAuth, setAuthenticated } = useAuthStore()
    const [initialized, setInitialized] = useState(false)
    const [usdBalance, setUsdBalance] = useState<string>("0")

    const router = useRouter()

    const baseSepoliaConfig = getChainConfig().chainConfig;

    const litChronicleYellowstoneConfig = {
        chainNamespace: CHAIN_NAMESPACES.EIP155,
        chainId: "0x2AC54",
        rpcTarget: "https://yellowstone-rpc.litprotocol.com/",
        displayName: "Lit Chronicle Yellowstone",
        blockExplorerUrl: "https://yellowstone-explorer.litprotocol.com/",
        ticker: "tstLPX",
        tickerName: "Lit Protocol",
        logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
    }

    // Initialize Web3Auth instance
    useEffect(() => {
        const init = async () => {
            try {
                const privateKeyProvider = new EthereumPrivateKeyProvider({
                    config: { chainConfig: baseSepoliaConfig, networks: { baseSepoliaConfig, litChronicleYellowstoneConfig } },
                })

                const web3AuthOptions: Web3AuthOptions = {
                    clientId: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID!,
                    web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
                    privateKeyProvider,
                    useAAWithExternalWallet: true,
                }

                const web3authInstance = new Web3Auth(web3AuthOptions)
                const adapters = await getDefaultExternalAdapters({
                    options: web3AuthOptions,
                })

                adapters.forEach((adapter: IAdapter<unknown>) => {
                    web3authInstance.configureAdapter(adapter)
                })

                await web3authInstance.initModal()

                setWeb3auth(web3authInstance)

                // Set initialized to true after Web3Auth is ready
                useAuthStore.getState().setInitialized(true)
                setInitialized(true)

                // Check if already connected
                if (web3authInstance.connected) {
                    setLoggedIn(true)
                    setProvider(web3authInstance.provider)
                    if (web3authInstance.provider) {
                        const accounts = await RPC.getAccounts(web3authInstance.provider)
                        setAddress(accounts[0])
                        setAuth(accounts[0])
                    }
                }
            } catch (error) {
                console.error("Failed to initialize Web3Auth:", error)
                useAuthStore.getState().setInitialized(true)
                setInitialized(true)
            }
        }
        init()
    }, [setAuth])

    const login = async () => {
        try {
            if (!web3auth) return
            const web3authProvider = await web3auth.connect()
            setProvider(web3authProvider)
            setLoggedIn(true)
            if (web3authProvider) {
                const accounts = await RPC.getAccounts(web3authProvider)
                const userAddress = accounts[0]
                setAddress(userAddress)
                setAuth(userAddress)
                localStorage.setItem('auth_state', 'true')
                localStorage.setItem('wallet_address', userAddress)
                setAuthenticated(true)
                toast.success('Successfully logged in!')
            }
        } catch (error) {
            console.error(error)
            toast.error('Failed to login')
        }
    }

    const logout = async () => {
        try {
            if (!web3auth) return
            await web3auth.logout()
            setProvider(null)
            setLoggedIn(false)
            setAddress(null)
            useAuthStore.getState().logout()
            router.push("/login")
        } catch (error) {
            console.error(error)
            toast.error('Failed to logout')
            router.push("/login")
        }
    }

    const getUserInfo = async () => {
        if (!web3auth?.connected) {
            return
        }
        try {
            const user = await web3auth.getUserInfo()
        } catch (error) {
            console.error(error)
            toast.error('Failed to get user info')
        }
    }

    const getBalance = async () => {
        if (!provider) return "0"
        try {
            const balance = await RPC.getBalance(provider)
            if (!balance) return "0"
            return balance
        } catch (error) {
            console.error(error)
            toast.error('Failed to get balance')
            return "0"
        }
    }

    const getAccounts = async () => {
        if (!provider) return "0x"
        try {
            const accounts = await RPC.getAccounts(provider)
            return accounts[0]
        } catch (error) {
            console.error(error)
            toast.error('Failed to get accounts')
            return "0x"
        }
    }

    const getChainId = async () => {
        if (!provider) return 0
        try {
            const chainId = await RPC.getChainId(provider)
            return chainId
        } catch (error) {
            console.error(error)
            toast.error('Failed to get chain id')
            return 0
        }
    }

    const getUsdBalance = async () => {
        if (!provider || !address) return;
        try {
            const ethersProvider = new ethers.providers.Web3Provider(provider);
            const usdtAddress = getChainConfig().USDT_ADDRESS;
            const contract = new ethers.Contract(usdtAddress, MockUSDTABI, ethersProvider);
            const balance = await contract.balanceOf(address);
            const formattedBalance = ethers.utils.formatUnits(balance, 18);
            setUsdBalance(Number(formattedBalance).toFixed(2));
        } catch (error) {
            console.error("Error getting USD balance:", error);
            toast.error('Failed to get USD balance');
            setUsdBalance("0");
        }
    }

    // Add useEffect to fetch USD balance when address changes
    useEffect(() => {
        if (address) {
            getUsdBalance();
        }
    }, [address]);

    const getBalanceTool = tool(
        async () => {
            const balance = await getBalance();
            return balance;
        },
        {
            name: "get_balance",
            description: "Get the balance of the user's connected wallet",
        }
    )

    return (
        <Web3Context.Provider
            value={{
                web3auth,
                provider,
                login,
                logout,
                getUserInfo,
                loggedIn,
                address,
                getBalance,
                getAccounts,
                getChainId,
                getBalanceTool,
                usdBalance,
                getUsdBalance,
            }}
        >
            {children}
        </Web3Context.Provider>
    )
} 