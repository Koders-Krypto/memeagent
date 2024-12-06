import { useState, useEffect } from 'react'
import { useWeb3Auth } from '@/providers/Web3Provider'

export function useBalance() {
    const [balance, setBalance] = useState<string>('0')
    const [loading, setLoading] = useState(false)
    const { getBalance, address } = useWeb3Auth()

    const fetchBalance = async () => {
        if (!address) return

        try {
            setLoading(true)
            const newBalance = await getBalance()
            setBalance(newBalance)
        } catch (error) {
            console.error('Error fetching balance:', error)
            setBalance('0')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchBalance()
        // Fetch balance every 30 seconds
        const interval = setInterval(fetchBalance, 30000)
        return () => clearInterval(interval)
    }, [address])

    return { balance, loading, refetch: fetchBalance }
} 