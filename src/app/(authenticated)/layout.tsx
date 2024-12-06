'use client'

import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/useAuthStore'
import { useWeb3Auth } from '@/providers/Web3Provider'
import { BottomNavigation } from '@/components/navigation/BottomNavigation'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function AuthenticatedLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const { isAuthenticated, initialized, setAuthenticated } = useAuthStore()
    const { address, loggedIn, provider } = useWeb3Auth()
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Check for persisted auth state
        const checkAuthState = async () => {
            try {
                // Check if we have a stored session
                const persistedAuth = localStorage.getItem('auth_state')
                const persistedAddress = localStorage.getItem('wallet_address')

                if (persistedAuth === 'true' && persistedAddress) {
                    setAuthenticated(true)
                    setIsLoading(false)
                    return
                }

                if (provider && !loggedIn) {
                    router.push("/login")
                }
            } catch (error) {
                console.error('Failed to check auth:', error)
            } finally {
                setIsLoading(false)
            }
        }

        if (initialized) {
            checkAuthState()
        }
    }, [provider, initialized, loggedIn])

    // Show loading state
    if (isLoading || !initialized) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin h-8 w-8" />
            </div>
        )
    }

    // If not authenticated, return null (redirect will happen in useEffect)
    // if (!isAuthenticated || !loggedIn || !address) {
    //     return null
    // }

    // Show actual layout if authenticated
    return (
        <>
            <main className="pb-16 pt-4">
                {children}
            </main>
            <BottomNavigation />
        </>
    )
} 