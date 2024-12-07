'use client'

import { Web3Provider } from './Web3Provider'
import { PWAProvider } from './PWAProvider'
import { ThemeProvider } from './ThemeProvider'
import { LangChainProvider } from './LangChainProvider'
import { LitProtocolProvider } from './LitProtocol'
import { MemeFactoryProvider } from './MemeFactory'
import { MemeTokenProvider } from './MemeToken'
import { LiquidityPairProvider } from './LiquidityPair'
import { GraphDataProvider } from './GraphData'
import { LiquidityFactoryProvider } from './LiquidityFactory'

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
            <Web3Provider>
                <MemeFactoryProvider>
                    <MemeTokenProvider>
                        <LiquidityPairProvider>
                            <LiquidityFactoryProvider>
                                <GraphDataProvider>
                                    <LitProtocolProvider>
                                        <LangChainProvider>
                                            <PWAProvider>
                                                {children}
                                            </PWAProvider>
                                        </LangChainProvider>
                                    </LitProtocolProvider>
                                </GraphDataProvider>
                            </LiquidityFactoryProvider>
                        </LiquidityPairProvider>
                    </MemeTokenProvider>
                </MemeFactoryProvider>
            </Web3Provider>
        </ThemeProvider>
    )
} 