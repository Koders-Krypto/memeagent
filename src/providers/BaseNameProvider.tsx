'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useLogin } from './LoginProvider'

interface BaseNameContextType {
    domainName: string | null
    loading: boolean
    error: Error | null
    registerDomain: (name: string) => Promise<void>
    getDomainDetails: (name: string) => Promise<any>
    getUserDomains: (address: string) => Promise<string[]>
    transferDomain: (name: string, to: string) => Promise<void>
    renewDomain: (name: string) => Promise<void>
}

const BaseNameContext = createContext<BaseNameContextType>({
    domainName: null,
    loading: false,
    error: null,
    registerDomain: async () => { },
    getDomainDetails: async () => ({}),
    getUserDomains: async () => [],
    transferDomain: async () => { },
    renewDomain: async () => { },
})

export function BaseNameProvider({ children }: { children: React.ReactNode }) {
    const { address } = useLogin()
    const [domainName, setDomainName] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    // Function to register a new domain
    const registerDomain = async (name: string) => {
        try {
            setLoading(true)
            // Implementation will go here once we have the Base Names contract
            setDomainName(name)
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to register domain'))
        } finally {
            setLoading(false)
        }
    }

    // Function to get domain details
    const getDomainDetails = async (name: string) => {
        try {
            setLoading(true)
            // Implementation will go here
            return {}
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to get domain details'))
            return {}
        } finally {
            setLoading(false)
        }
    }

    // Function to get all domains of a user
    const getUserDomains = async (address: string) => {
        try {
            setLoading(true)
            // Implementation will go here
            return []
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to get user domains'))
            return []
        } finally {
            setLoading(false)
        }
    }

    // Function to transfer domain
    const transferDomain = async (name: string, to: string) => {
        try {
            setLoading(true)
            // Implementation will go here
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to transfer domain'))
        } finally {
            setLoading(false)
        }
    }

    // Function to renew domain
    const renewDomain = async (name: string) => {
        try {
            setLoading(true)
            // Implementation will go here
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to renew domain'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <BaseNameContext.Provider
            value={{
                domainName,
                loading,
                error,
                registerDomain,
                getDomainDetails,
                getUserDomains,
                transferDomain,
                renewDomain,
            }}
        >
            {children}
        </BaseNameContext.Provider>
    )
}

export const useBaseName = () => useContext(BaseNameContext) 