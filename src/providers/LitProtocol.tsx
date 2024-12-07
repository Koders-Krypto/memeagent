import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LIT_RPC, LIT_NETWORK, LIT_ABILITY, AuthMethodScope } from "@lit-protocol/constants";
import {
    createSiweMessage,
    createSiweMessageWithRecaps,
    generateAuthSig,
    LitActionResource,
    LitPKPResource,
} from "@lit-protocol/auth-helpers";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import { ethers } from 'ethers';
import { useWeb3Auth } from './Web3Provider';
import { CHAIN_NAMESPACES } from '@web3auth/base';
import { getChainConfig } from '@/utils/config';

interface LitContextType {
    litNodeClient: LitNodeClient | null;
    executeLitAction: (hoursValid: number) => Promise<void>;
    mintCapacityCredits: (requestsPerKilosecond: number, daysValid: number) => Promise<string>;
}

const LitContext = createContext<LitContextType | undefined>(undefined);

export function LitProtocolProvider({ children }: { children: ReactNode }) {
    const [litNodeClient, setLitNodeClient] = useState<LitNodeClient | null>(null);

    const { web3auth, provider, address } = useWeb3Auth();

    useEffect(() => {
        const initLitClient = async () => {
            const client = new LitNodeClient({
                litNetwork: LIT_NETWORK.DatilDev,
                debug: true,
            });
            await client.connect();
            setLitNodeClient(client);
        };
        initLitClient();
    }, []);

    const getSessionSigs = async (hoursValid: number) => {
        if (!litNodeClient || !web3auth || !provider || !address) throw new Error("Lit client not initialized");

        await web3auth.addChain({
            chainNamespace: CHAIN_NAMESPACES.EIP155,
            chainId: "0x2AC54",
            rpcTarget: "https://yellowstone-rpc.litprotocol.com/",
            displayName: "Lit Chronicle Yellowstone",
            blockExplorerUrl: "https://yellowstone-explorer.litprotocol.com/",
            ticker: "tstLPX",
            tickerName: "Lit Protocol",
            logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
        })
        await web3auth.switchChain({ chainId: "0x2AC54" });
        const ethersProvider = new ethers.providers.Web3Provider(provider);
        const signer = ethersProvider.getSigner();

        const litContracts = new LitContracts({
            signer: signer,
            network: LIT_NETWORK.DatilDev,
            debug: true
        });
        await litContracts.connect();

        // const pkpInfo = (await litContracts.pkpNftContractUtils.write.mint()).pkp;

        const sessionSigs = await litNodeClient.getSessionSigs({
            chain: "baseSepolia",
            expiration: new Date(Date.now() + 1000 * 60 * 60 * hoursValid).toISOString(),
            resourceAbilityRequests: [
                // {
                //     resource: new LitPKPResource(pkpInfo.tokenId),
                //     ability: LIT_ABILITY.PKPSigning,
                // },
                {
                    resource: new LitActionResource("*"),
                    ability: LIT_ABILITY.LitActionExecution,
                },
            ],
            authNeededCallback: async ({
                uri,
                expiration,
                resourceAbilityRequests,
            }) => {
                const toSign = await createSiweMessage({
                    uri,
                    expiration,
                    resources: resourceAbilityRequests,
                    walletAddress: address,
                    nonce: await litNodeClient.getLatestBlockhash(),
                    litNodeClient,
                });

                return await generateAuthSig({
                    signer: signer,
                    toSign,
                });
            },
        });

        return { signer, litContracts, sessionSigs };
    };

    const executeLitAction = async (hoursValid: number = 24) => {
        if (!litNodeClient || !provider || !address) throw new Error("Lit client not initialized");

        const { signer, litContracts, sessionSigs } = await getSessionSigs(hoursValid);
        console.log(sessionSigs)


        const toSign = await createSiweMessageWithRecaps({
            uri: window.location.href,
            expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // 10 minutes
            resources: [{
                resource: new LitActionResource("*"),
                ability: LIT_ABILITY.LitActionExecution,
            }],
            walletAddress: address,
            nonce: await litNodeClient.getLatestBlockhash(),
            litNodeClient: litNodeClient,
        });

        const authSig = await generateAuthSig({
            signer: signer,
            toSign,
        });


        const authMethod = {
            authMethodType: 1, // For Ethereum wallet
            accessToken: JSON.stringify(authSig),
        };

        const mintInfo = await litContracts.mintWithAuth({
            authMethod: authMethod,
            scopes: [
                AuthMethodScope.SignAnything,
                AuthMethodScope.PersonalSign,
            ],
        });

        console.log('PKP Token ID:', mintInfo.pkp.tokenId);
        console.log('PKP Public Key:', mintInfo.pkp.publicKey);
        console.log('PKP Ethereum Address:', mintInfo.pkp.ethAddress);

        const baseProvider = new ethers.providers.JsonRpcProvider("https://base-sepolia-rpc.publicnode.com");
        const masterKey = new ethers.Wallet(process.env.NEXT_PUBLIC_ETHEREUM_PRIVATE_KEY!, baseProvider);
        await (await masterKey.sendTransaction({ to: mintInfo.pkp.ethAddress, value: ethers.utils.parseEther("0.00001") })).wait();
        const usdt = new ethers.Contract(getChainConfig().USDT_ADDRESS, ["function mint(address to, uint256 amount)", "function approve(address spender, uint256 amount)"], baseProvider);
        await (await usdt.connect(masterKey).mint(mintInfo.pkp.ethAddress, ethers.utils.parseEther("1000000"))).wait();
        // const pkpNonce = await baseProvider.getTransactionCount(mintInfo.pkp.ethAddress, 'latest');

        const litAction = `
        const go = async () => {
            const provider = new ethers.providers.JsonRpcProvider("https://base-sepolia-rpc.publicnode.com");
            const pkpNonce = await provider.getTransactionCount(ethAddress, 'latest');

            const usdt = new ethers.Contract("0x65E433162535b4d0cF34a8630684fC3211ce1EE9", ["function mint(address to, uint256 amount)", "function approve(address spender, uint256 amount)"]);

            const unsignedApproveTx = {
                to: usdt.address,
                data: usdt.interface.encodeFunctionData("approve", ["0xb67444e08b5182549Cf1921F2EF63DC3D8b32eed", ethers.utils.parseEther("1000000")]),
                nonce: pkpNonce,
                chainId: 84532,
                gasLimit: 100_000,
                gasPrice: (await provider.getGasPrice()).toHexString(),
            };

            const unsignedApproveTxHash = ethers.utils.keccak256(ethers.utils.serializeTransaction(unsignedApproveTx));

            const approveSignature = await Lit.Actions.signAndCombineEcdsa({
                toSign: ethers.utils.arrayify(unsignedApproveTxHash),
                publicKey,
                sigName: 'approveSig',
            });

            const approveJsonSignature = JSON.parse(approveSignature);
            approveJsonSignature.r = "0x" + approveJsonSignature.r.substring(2);
            approveJsonSignature.s = "0x" + approveJsonSignature.s;
            const approveHexSignature = ethers.utils.joinSignature(approveJsonSignature);

            const approveSignedTx = ethers.utils.serializeTransaction(unsignedApproveTx, approveHexSignature);
            provider.sendTransaction(approveSignedTx);

            const memeCoinFactoryAddress = "0xb67444e08b5182549Cf1921F2EF63DC3D8b32eed";
            const memeCoinFactoryAbi = [
                {
                    "inputs": [
                        { "internalType": "string", "name": "name", "type": "string" },
                        { "internalType": "string", "name": "symbol", "type": "string" },
                        { "internalType": "uint256", "name": "maxSupply", "type": "uint256" },
                        { "internalType": "uint256", "name": "initialMint", "type": "uint256" },
                        { "internalType": "uint256", "name": "usdtAmount", "type": "uint256" }
                    ],
                    "name": "createMemeCoin",
                    "outputs": [{ "internalType": "address", "name": "memeCoin", "type": "address" }],
                    "stateMutability": "nonpayable",
                    "type": "function"
                }
            ];

            const createMemeCoinUnsignedTx = {
                to: memeCoinFactoryAddress,
                data: new ethers.Contract(memeCoinFactoryAddress, memeCoinFactoryAbi).interface.encodeFunctionData(
                    "createMemeCoin", ['Hahahahaa', 'test', '10000000000000000000000000000', '1000000000000000000000000000', '100000000000000000000']
                ),
                nonce: pkpNonce + 1,
                chainId: 84532,
                gasLimit: 3_000_000,
                gasPrice: (await provider.getGasPrice()).toHexString(),
            };

            const createMemeCoinUnsignedTxHash = ethers.utils.keccak256(ethers.utils.serializeTransaction(createMemeCoinUnsignedTx));

            const createMemeCoinSignature = await Lit.Actions.signAndCombineEcdsa({
                toSign: ethers.utils.arrayify(createMemeCoinUnsignedTxHash),
                publicKey,
                sigName: 'createMemeCoinSig',
            });

            const createMemeCoinJsonSignature = JSON.parse(createMemeCoinSignature);
            createMemeCoinJsonSignature.r = "0x" + createMemeCoinJsonSignature.r.substring(2);
            createMemeCoinJsonSignature.s = "0x" + createMemeCoinJsonSignature.s;
            const createMemeCoinHexSignature = ethers.utils.joinSignature(createMemeCoinJsonSignature);

            const createMemeCoinSignedTx = ethers.utils.serializeTransaction(createMemeCoinUnsignedTx, createMemeCoinHexSignature);
            provider.sendTransaction(createMemeCoinSignedTx);
        
            Lit.Actions.setResponse({ response: "success" });
        };
        go();
      `;
        const result = await litNodeClient.executeJs({
            sessionSigs,
            code: litAction,
            jsParams: {
                publicKey: mintInfo.pkp.publicKey,
                ethAddress: mintInfo.pkp.ethAddress,
            }
        });
        console.log(result);
    };

    const mintCapacityCredits = async (requestsPerKilosecond: number, daysValid: number) => {
        const signer = new ethers.Wallet(
            process.env.NEXT_PUBLIC_ETHEREUM_PRIVATE_KEY!,
            new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
        );

        const contractClient = new LitContracts({
            signer,
            network: LIT_NETWORK.DatilTest,
        });

        await contractClient.connect();

        const { capacityTokenIdStr } = await contractClient.mintCapacityCreditsNFT({
            requestsPerKilosecond,
            daysUntilUTCMidnightExpiration: daysValid,
        });

        return capacityTokenIdStr;
    };

    return (
        <LitContext.Provider value={{ litNodeClient, executeLitAction, mintCapacityCredits }}>
            {children}
        </LitContext.Provider>
    );
}

export function useLitProtocol() {
    const context = useContext(LitContext);
    if (context === undefined) {
        throw new Error('useLitProtocol must be used within a LitProtocolProvider');
    }
    return context;
}
