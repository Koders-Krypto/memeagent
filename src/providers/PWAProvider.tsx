'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast'

interface PWAContextType {
    isInstallable: boolean
    isInstalled: boolean
    installApp: () => Promise<void>
    version: string
    updateAvailable: boolean
    updateApp: () => Promise<void>
}

const PWAContext = createContext<PWAContextType>({
    isInstallable: false,
    isInstalled: false,
    installApp: async () => { },
    version: '1.0.0',
    updateAvailable: false,
    updateApp: async () => { },
})

export function PWAProvider({ children }: { children: React.ReactNode }) {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
    const [isInstalled, setIsInstalled] = useState(false)
    const [updateAvailable, setUpdateAvailable] = useState(false)
    const [version, setVersion] = useState('1.0.0')
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        // Check if device is mobile
        const checkMobile = () => {
            const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
            return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase())
        }
        setIsMobile(checkMobile())

        // Check if app is installed
        const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches
        setIsInstalled(isInStandaloneMode)

        // Handle installation prompt only on mobile
        window.addEventListener('beforeinstallprompt', (e) => {
            if (isMobile) {
                e.preventDefault()
                setDeferredPrompt(e)
            }
        })

        // Handle PWA updates
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then((registration) => {
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing
                    if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                setUpdateAvailable(true)
                                toast.success('App update available!')
                            }
                        })
                    }
                })
            })

            // Fetch version from manifest
            fetch('/manifest.json')
                .then(response => response.json())
                .then(data => setVersion(data.version))
                .catch(console.error)
        }
    }, [isMobile])

    const installApp = async () => {
        if (!deferredPrompt || !isMobile) return

        try {
            await deferredPrompt.prompt()
            const choiceResult = await deferredPrompt.userChoice

            if (choiceResult.outcome === 'accepted') {
                toast.success('App installed successfully!')
                setIsInstalled(true)
            }
        } catch (error) {
            console.error('Installation error:', error)
            toast.error('Failed to install app')
        } finally {
            setDeferredPrompt(null)
        }
    }

    const updateApp = async () => {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.ready
                await registration.update()
                toast.success('App updated! Please refresh the page.')
                setUpdateAvailable(false)
            } catch (error) {
                console.error('Update error:', error)
                toast.error('Failed to update app')
            }
        }
    }

    return (
        <PWAContext.Provider
            value={{
                isInstallable: !!deferredPrompt && isMobile,
                isInstalled,
                installApp,
                version,
                updateAvailable,
                updateApp,
            }}
        >
            {children}
        </PWAContext.Provider>
    )
}

export const usePWA = () => useContext(PWAContext) 