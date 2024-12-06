'use client'

import { useWeb3Auth } from '@/providers/Web3Provider'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useState } from 'react'
import { usePWA } from '@/providers/PWAProvider'
import { useTheme } from '@/providers/ThemeProvider'
import { Sun, Moon, Monitor } from 'lucide-react'

export default function SettingsPage() {
    const router = useRouter()
    const { address, logout } = useWeb3Auth()
    const { version, updateAvailable, updateApp } = usePWA()
    const { theme, setTheme } = useTheme()
    const [isLoggingOut, setIsLoggingOut] = useState(false)

    const handleLogout = async () => {
        try {
            setIsLoggingOut(true)
            await logout()
            toast.success('Logged out successfully')
            router.replace('/login')
        } catch (error) {
            console.error('Logout error:', error)
            toast.error('Failed to logout')
        } finally {
            setIsLoggingOut(false)
        }
    }

    return (
        <div className="container p-4">
            <h1 className="text-2xl font-bold mb-4">Settings</h1>
            <div className="space-y-4">
                <div className="p-4 border rounded-lg dark:border-gray-700">
                    <h2 className="text-xl font-semibold mb-2">Account</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 break-all">
                        Connected Address: {address || '0x...'}
                    </p>
                </div>
                <div className="p-4 border rounded-lg dark:border-gray-700">
                    <h2 className="text-xl font-semibold mb-2">Preferences</h2>
                    <div className="flex flex-col space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm">Theme</p>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setTheme('light')}
                                    className={`p-2 rounded-lg flex items-center space-x-1 ${theme === 'light'
                                            ? 'bg-primary text-white'
                                            : 'bg-gray-100 dark:bg-gray-700'
                                        }`}
                                >
                                    <Sun size={16} />
                                    <span>Light</span>
                                </button>
                                <button
                                    onClick={() => setTheme('dark')}
                                    className={`p-2 rounded-lg flex items-center space-x-1 ${theme === 'dark'
                                            ? 'bg-primary text-white'
                                            : 'bg-gray-100 dark:bg-gray-700'
                                        }`}
                                >
                                    <Moon size={16} />
                                    <span>Dark</span>
                                </button>
                                <button
                                    onClick={() => setTheme('system')}
                                    className={`p-2 rounded-lg flex items-center space-x-1 ${theme === 'system'
                                            ? 'bg-primary text-white'
                                            : 'bg-gray-100 dark:bg-gray-700'
                                        }`}
                                >
                                    <Monitor size={16} />
                                    <span>System</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-4 border rounded-lg dark:border-gray-700">
                    <h2 className="text-xl font-semibold mb-2">Network</h2>
                    <p className="text-gray-600 dark:text-gray-400">Connected to Sepolia Testnet</p>
                </div>
                <div className="p-4 border rounded-lg dark:border-gray-700">
                    <h2 className="text-xl font-semibold mb-2">App Info</h2>
                    <p className="text-gray-600 dark:text-gray-400">Version: {version}</p>
                    {updateAvailable && (
                        <button
                            onClick={updateApp}
                            className="mt-2 w-full p-2 bg-primary text-white rounded"
                        >
                            Update Available
                        </button>
                    )}
                </div>
                <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full p-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoggingOut ? 'Logging out...' : 'Logout'}
                </button>
            </div>
        </div>
    )
} 