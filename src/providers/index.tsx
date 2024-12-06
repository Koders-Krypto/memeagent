'use client'

import { Web3Provider } from './Web3Provider'
import { PWAProvider } from './PWAProvider'
import { ThemeProvider } from './ThemeProvider'
import { LangChainProvider } from './LangChainProvider'
import { LitProtocolProvider } from './LitProtocol'
import { MemeFactoryProvider } from './MemeFactory'
import { MemeTokenProvider } from './MemeToken'
import { LiquidityPairProvider } from './LiquidityPair'
import { ContractsDataProvider } from './ContractsData'

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
            <Web3Provider>
                <LitProtocolProvider>
                    <MemeFactoryProvider>
                        <MemeTokenProvider>
                            <LiquidityPairProvider>
                                <ContractsDataProvider>
                                    <LangChainProvider>
                                        <PWAProvider>
                                            {children}
                                        </PWAProvider>
                                    </LangChainProvider>
                                </ContractsDataProvider>
                            </LiquidityPairProvider>
                        </MemeTokenProvider>
                    </MemeFactoryProvider>
                </LitProtocolProvider>
            </Web3Provider>
        </ThemeProvider>
    )
} 