'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light' | 'system'

interface ThemeContextType {
    theme: Theme
    setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType>({
    theme: 'system',
    setTheme: () => null,
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>('system')
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        // Get stored theme or default to system
        const storedTheme = localStorage.getItem('theme') as Theme || 'system'
        setTheme(storedTheme)
    }, [])

    useEffect(() => {
        if (!mounted) return

        const root = window.document.documentElement

        if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
            root.classList.toggle('dark', systemTheme === 'dark')

            // Listen for system theme changes
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
            const handleChange = (e: MediaQueryListEvent) => {
                root.classList.toggle('dark', e.matches)
            }
            mediaQuery.addEventListener('change', handleChange)
            return () => mediaQuery.removeEventListener('change', handleChange)
        } else {
            root.classList.toggle('dark', theme === 'dark')
        }

        localStorage.setItem('theme', theme)
    }, [theme, mounted])

    // Prevent flash of incorrect theme
    if (!mounted) {
        return null
    }

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export const useTheme = () => useContext(ThemeContext) 