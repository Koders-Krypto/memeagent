import { IProvider } from "@web3auth/base";
import { ethers } from "ethers";

export default class EthereumRpc {
    private provider: IProvider;

    constructor(provider: IProvider) {
        this.provider = provider;
    }

    async getAccounts(): Promise<string[]> {
        try {
            const provider = new ethers.providers.Web3Provider(this.provider as any);
            const signer = provider.getSigner();
            const address = await signer.getAddress();
            return [address];
        } catch (error) {
            return [];
        }
    }

    async getBalance(): Promise<string> {
        try {
            const provider = new ethers.providers.Web3Provider(this.provider as any);
            const signer = provider.getSigner();
            const address = await signer.getAddress();
            const balance = await provider.getBalance(address);
            return ethers.utils.formatEther(balance);
        } catch (error) {
            return "0";
        }
    }

    async getChainId(): Promise<number> {
        try {
            const provider = new ethers.providers.Web3Provider(this.provider as any);
            const { chainId } = await provider.getNetwork();
            return chainId;
        } catch (error) {
            return 0;
        }
    }

    static async getAccounts(provider: IProvider): Promise<string[]> {
        const rpc = new EthereumRpc(provider);
        return await rpc.getAccounts();
    }

    static async getBalance(provider: IProvider): Promise<string> {
        const rpc = new EthereumRpc(provider);
        return await rpc.getBalance();
    }

    static async getChainId(provider: IProvider): Promise<number> {
        const rpc = new EthereumRpc(provider);
        return await rpc.getChainId();
    }
} 