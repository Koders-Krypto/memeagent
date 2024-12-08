"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useWeb3Auth } from "@/providers/Web3Provider";
import { BottomNavigation } from "@/components/navigation/BottomNavigation";
import { Loader2, Power } from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, initialized, setAuthenticated } = useAuthStore();
  const { address, loggedIn, provider, logout } = useWeb3Auth();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      toast.success("Logged out successfully");
      router.replace("/");
    } catch (error) {
      console.error("Logout error:", error);
      // toast.error("Failed to logout");
      router.replace("/");
    } finally {
      setIsLoggingOut(false);
    }
  };

  useEffect(() => {
    // Check for persisted auth state
    const checkAuthState = async () => {
      try {
        // Check if we have a stored session
        const persistedAuth = localStorage.getItem("auth_state");
        const persistedAddress = localStorage.getItem("wallet_address");

        if (persistedAuth === "true" && persistedAddress) {
          setAuthenticated(true);
          setIsLoading(false);
          return;
        }

        if (provider && !loggedIn) {
          router.push("/");
        }
      } catch (error) {
        console.error("Failed to check auth:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (initialized) {
      checkAuthState();
    }
  }, [provider, initialized, loggedIn]);

  // Show loading state
  if (isLoading || !initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  }

  // If not authenticated, return null (redirect will happen in useEffect)
  // if (!isAuthenticated || !loggedIn || !address) {
  //     return null
  // }

  // Show actual layout if authenticated
  return (
    <>
      <main className="pb-16 w-full">
        {" "}
        <div className="flex flex-row justify-between items-center px-4 py-4 border-b border-primary">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center">
                <Image
                  src="/agent.svg"
                  alt="Meme Agent"
                  width={24}
                  height={24}
                  className="text-black"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold">Meme Agent AI</h1>
                <p className="text-xs text-gray-500">
                  Connected to {address?.slice(0, 6)}...{address?.slice(-4)}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className=" p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Power size={16} />
          </button>
        </div>
        {children}
      </main>
      <BottomNavigation />
    </>
  );
}
