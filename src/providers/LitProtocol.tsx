import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LIT_RPC, LIT_NETWORK, LIT_ABILITY, AuthMethodScope } from "@lit-protocol/constants";
import {
    createSiweMessageWithRecaps,
    generateAuthSig,
    LitActionResource,
} from "@lit-protocol/auth-helpers";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import { ethers } from 'ethers';
import { useWeb3Auth } from './Web3Provider';

interface LitContextType {
    litNodeClient: LitNodeClient | null;
    executeLitAction: (hoursValid: number) => Promise<void>;
    mintCapacityCredits: (requestsPerKilosecond: number, daysValid: number) => Promise<string>;
}

const LitContext = createContext<LitContextType | undefined>(undefined);

export function LitProtocolProvider({ children }: { children: ReactNode }) {
    const [litNodeClient, setLitNodeClient] = useState<LitNodeClient | null>(null);

    const { provider, address } = useWeb3Auth();

    useEffect(() => {
        const initLitClient = async () => {
            const client = new LitNodeClient({
                litNetwork: LIT_NETWORK.DatilDev,
                debug: false,
            });
            await client.connect();
            setLitNodeClient(client);
        };
        initLitClient();
    }, []);

    const getSessionSigs = async (hoursValid: number) => {
        if (!litNodeClient || !provider || !address) throw new Error("Lit client not initialized");

        const ethersProvider = new ethers.providers.Web3Provider(provider!);
        const signer = ethersProvider.getSigner();

        return await litNodeClient.getSessionSigs({
            chain: "baseSepolia",
            expiration: new Date(Date.now() + 1000 * 60 * 60 * hoursValid).toISOString(),
            resourceAbilityRequests: [
                {
                    resource: new LitActionResource("*"),
                    ability: LIT_ABILITY.LitActionExecution,
                },
            ],
            authNeededCallback: async ({ resourceAbilityRequests, expiration, uri }) => {
                const toSign = await createSiweMessageWithRecaps({
                    uri: uri!,
                    expiration: expiration!,
                    resources: resourceAbilityRequests!,
                    walletAddress: address,
                    nonce: await litNodeClient.getLatestBlockhash(),
                    litNodeClient,
                });

                return await generateAuthSig({
                    signer,
                    toSign,
                });
            },
        });
    };

    const executeLitAction = async (hoursValid: number = 24) => {
        if (!litNodeClient || !provider || !address) throw new Error("Lit client not initialized");

        const sessionSigs = await getSessionSigs(hoursValid);

        const ethersProvider = new ethers.providers.Web3Provider(provider!);
        const signer = ethersProvider.getSigner();

        const contractClient = new LitContracts({ signer });

        await contractClient.connect();

        const toSign = await createSiweMessageWithRecaps({
            uri: window.location.href,
            expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // 10 minutes
            resources: [],
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

        const mintInfo = await contractClient.mintWithAuth({
            authMethod: authMethod,
            scopes: [
                AuthMethodScope.SignAnything,
                AuthMethodScope.PersonalSign,
            ],
        });

        console.log('PKP Token ID:', mintInfo.pkp.tokenId);
        console.log('PKP Public Key:', mintInfo.pkp.publicKey);
        console.log('PKP Ethereum Address:', mintInfo.pkp.ethAddress);

        const litAction = `
        const go = async () => {
          const provider = new ethers.providers.JsonRpcProvider('https://sepolia.base.org');
          const pkpSigner = Lit.Actions.getSigner('${mintInfo.pkp.publicKey}', provider);
          const contract = new ethers.Contract('0x0C58c60263949b7bDb0ae49081e6DD629df69459', [{
    "inputs": [
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "symbol",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "maxSupply",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "initialMint",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "usdtAmount",
        "type": "uint256"
      }
    ],
    "name": "createMemeCoin",
    "outputs": [
      {
        "internalType": "address",
        "name": "memeCoin",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }], pkpSigner);
      
          // Example write function call
          const tx = await contract.createMemeCoin(['test', 'test', 1000000000000000000000000, 1000000000000000000, 1000000000000000000], {
            gasLimit: 10000000,
            gasPrice: ethers.utils.parseUnits('10', 'gwei'),
          });
      
          const receipt = await tx.wait();
          Lit.Actions.setResponse({ response: receipt });
        };
        go();
      `;
        const result = await litNodeClient.executeJs({
            sessionSigs,
            code: litAction,
            // ipfsId: ipfsCid,
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
