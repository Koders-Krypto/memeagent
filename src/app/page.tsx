'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Shield, Brain, Wallet, Lock, Zap, ArrowRight } from 'lucide-react'
import { Logo } from '@/components/common/Logo'
import { useAuthStore } from '@/store/useAuthStore'
import { useEffect } from 'react'

const features = [
  {
    icon: Shield,
    title: 'Secure Transactions',
    description: 'Advanced security protocols to protect your digital assets'
  },
  {
    icon: Brain,
    title: 'AI-Powered Assistant',
    description: 'Intelligent guidance for all your wallet operations'
  },
  {
    icon: Wallet,
    title: 'Smart Wallet',
    description: 'Next-generation wallet with advanced features'
  },
  {
    icon: Lock,
    title: 'Privacy First',
    description: 'Your data stays private and secure'
  },
  {
    icon: Zap,
    title: 'Fast & Efficient',
    description: 'Lightning-fast transactions and responses'
  }
]

export default function LandingPage() {
  const router = useRouter()
  const { isAuthenticated, initialized } = useAuthStore()

  useEffect(() => {
    // Only redirect if initialized and authenticated
    if (initialized && isAuthenticated) {
      router.replace('/dashboard')
    }
  }, [initialized, isAuthenticated, router])

  // If not initialized or not authenticated, show landing page
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <Logo />
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Secure & Intelligent Wallet Management
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Experience the future of digital asset management with AI-powered security
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/login')}
            className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-primary rounded-xl hover:bg-primary/90 transition-colors"
          >
            Launch App
            <ArrowRight className="ml-2 w-5 h-5" />
          </motion.button>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-24">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.5 }}
              className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-16 text-center text-gray-600 dark:text-gray-400">
        <p>© 2024 SecurIQ. All rights reserved.</p>
      </footer>
    </div>
  )
}
