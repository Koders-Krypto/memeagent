'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useWeb3Auth } from '@/providers/Web3Provider'
import { useAuthStore } from '@/store/useAuthStore'
import { Loader2 } from 'lucide-react'
import { Logo } from '@/components/common/Logo'
import { motion } from 'framer-motion'

export default function LoginPage() {
    const router = useRouter()
    const { login, loggedIn, address } = useWeb3Auth()
    const { isAuthenticated, initialized } = useAuthStore()

    useEffect(() => {
        if (initialized && isAuthenticated && loggedIn && address) {
            router.replace('/dashboard')
        }
    }, [initialized, isAuthenticated, loggedIn, address, router])

    if (!initialized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="animate-spin h-8 w-8 text-primary" />
            </div>
        )
    }

    if (isAuthenticated && loggedIn && address) {
        return null
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="bg-card border border-card-border rounded-2xl shadow-xl p-8 space-y-8 dark:bg-gray-800">
                    <div className="text-center">
                        <Logo width={100} height={100} animate={true} />
                        <h1 className="text-2xl font-bold mt-6 text-foreground">Welcome to SecurIQ</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">Connect your wallet securely</p>
                    </div>

                    <button
                        onClick={login}
                        className="w-full p-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        Connect Wallet
                    </button>
                </div>
            </motion.div>
        </div>
    )
} 
