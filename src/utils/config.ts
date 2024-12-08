import { CHAIN_NAMESPACES } from "@web3auth/base";

export const getChainConfig = () => {
    return bnbSepolia
    //bnbSepolia, polygonMumbai, Supratestnet baseSepolia; 
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
    MEME_FACTORY_ADDRESS: "0xb67444e08b5182549Cf1921F2EF63DC3D8b32eed",
    LIQUIDITY_FACTORY_ADDRESS: "0x22900c39c0C71D44C3952c67438FD3f8c75ee6EC"
}

const bnbSepolia = {
    chainConfig: {
        chainNamespace: CHAIN_NAMESPACES.EIP155,
        chainId: "0x15eb",
        rpcTarget: "https://opbnb-testnet-rpc.bnbchain.org",
        displayName: "OP BNB Testnet",
        blockExplorerUrl: "https://opbnb-testnet.bscscan.com/",
        ticker: "BNB",
        tickerName: "BNB",
        logo: "https://cryptologos.cc/logos/binance-bnb-logo.png",
    },
    USDT_ADDRESS: "0x0197933AC6A1d7d5b21CBeE15a1b5f05AD1Dd3D8",
    MEME_FACTORY_ADDRESS: "0xAb5036d0E4e7Db4FeB20077dC6F2024032082330",
    LIQUIDITY_FACTORY_ADDRESS: "0x0862756DdC9188A2f723B6Cd2Ed4112030E6daff"
}

const polygonMumbai = {
    chainConfig: {
        chainNamespace: CHAIN_NAMESPACES.EIP155,
        chainId: "0x13882",
        rpcTarget: "https://polygon-amoy.drpc.org",
        displayName: "Polygon Amoy",
        blockExplorerUrl: "https://www.oklink.com/amoy/",
        ticker: "MATIC",
        tickerName: "MATIC",
        logo: "https://cryptologos.cc/logos/polygon-matic-logo.png",
    },
    USDT_ADDRESS: "0x0B344563CEEa1AbeD9eCf07B0EF131ab43Bf2138",
    MEME_FACTORY_ADDRESS: "0x0862756DdC9188A2f723B6Cd2Ed4112030E6daff",
    LIQUIDITY_FACTORY_ADDRESS: "0x0197933AC6A1d7d5b21CBeE15a1b5f05AD1Dd3D8"
}


const supratestnet = {
    chainConfig: {
        chainNamespace: CHAIN_NAMESPACES.EIP155,
        chainId: "232",
        rpcTarget: "https://rpc-evmstaging.supra.com/rpc/v1/eth",
        displayName: "Supra Testnet",
        blockExplorerUrl: "https://supra-testnet.notdefined.com/",
        ticker: "SUPRA",
        tickerName: "SUPRA",
        logo: "https://cryptologos.cc/logos/supra-supra-logo.png",
    }
}