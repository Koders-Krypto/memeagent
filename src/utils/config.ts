import { CHAIN_NAMESPACES } from "@web3auth/base";

export const getChainConfig = () => {
    return baseSepolia; // bnbSepolia, polygonMumbai, Supratestnet 
}

const baseSepolia = {
    chainConfig: {
        chainNamespace: CHAIN_NAMESPACES.EIP155,
        chainId: "0x14a34",
        rpcTarget: "https://sepolia.base.org",
        displayName: "Base Sepolia Testnet",
        blockExplorerUrl: "https://sepolia.basescan.org/",
        ticker: "ETH",
        tickerName: "Ethereum",
        logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
    },
    USDT_ADDRESS: "0x65E433162535b4d0cF34a8630684fC3211ce1EE9",
    MEME_FACTORY_ADDRESS: "0xb67444e08b5182549Cf1921F2EF63DC3D8b32eed"
}