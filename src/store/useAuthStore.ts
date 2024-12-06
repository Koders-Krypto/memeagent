import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
    isAuthenticated: boolean
    initialized: boolean
    address: string | null
    setAuth: (address: string) => void
    logout: () => void
    setInitialized: (initialized: boolean) => void
    setAuthenticated: (value: boolean) => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            isAuthenticated: false,
            initialized: false,
            address: null,
            setAuth: (address) => set({ address, isAuthenticated: true }),
            logout: () => set({ address: null, isAuthenticated: false }),
            setInitialized: (initialized) => set({ initialized }),
            setAuthenticated: (value) => set({ isAuthenticated: value })
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                isAuthenticated: state.isAuthenticated,
                address: state.address,
                initialized: state.initialized,
            }),
        }
    )
) 