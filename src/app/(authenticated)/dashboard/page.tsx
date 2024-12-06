'use client'

import { useContractsData } from '@/providers/ContractsData'
import { useWeb3Auth } from '@/providers/Web3Provider'

export default function DashboardPage() {
    const { address, usdBalance } = useWeb3Auth()

    const { memeCoins } = useContractsData()

    return (
        <div className="container p-4">
            <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
            <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                    <h2 className="text-xl font-semibold mb-2">Account</h2>
                    <p className="text-sm font-mono text-gray-600 break-all">
                        {address || 'Not connected'}
                    </p>
                </div>
                <div className="p-4 border rounded-lg">
                    <h2 className="text-xl font-semibold mb-2">Your Token Balance</h2>
                    <p className="text-gray-600">{usdBalance} USDT</p>
                </div>
                <div className="p-4 border rounded-lg">
                    <h2 className="text-xl font-semibold mb-2">Your Meme Tokens</h2>
                    {memeCoins.length > 0 ? (
                        <p className="text-gray-600">{memeCoins.length} tokens created</p>
                    ) : (
                        <p className="text-gray-600">No tokens created yet</p>
                    )}
                </div>
                <div className="p-4 border rounded-lg">
                    <h2 className="text-xl font-semibold mb-2">Recent Activity</h2>
                    <p className="text-gray-600">No recent activity</p>
                </div>
            </div>
        </div>
    )
} 