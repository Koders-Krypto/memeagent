"use client";

import { useWeb3Auth } from "@/providers/Web3Provider";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useState } from "react";
import { usePWA } from "@/providers/PWAProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { Sun, Moon, Monitor, Power } from "lucide-react";
import { Truncate } from "@/utils/truncate";

export default function SettingsPage() {
  const router = useRouter();
  const { address, logout } = useWeb3Auth();
  const { version, updateAvailable, updateApp } = usePWA();
  const { theme, setTheme } = useTheme();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      toast.success("Logged out successfully");
      router.replace("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="w-full p-4">
      <div className="flex flex-row justify-between items-start">
        <h1 className="text-2xl font-bold mb-4">Settings</h1>
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className=" p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Power size={16} />
        </button>
      </div>
      <div className="space-y-4">
        <div className="p-4 border border-primary rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Account</h2>
          <p className="text-sm text-gray-600 break-all">
            Connected Address:{" "}
            {(address && Truncate(address, 18, "...")) || "0x..."}
          </p>
        </div>
        <div className="p-4 border border-primary rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Preferences</h2>
          <div className="flex flex-col space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-1">
              <p className="text-sm">Theme</p>
              <div className="flex space-x-2">
                <button
                  onClick={() => setTheme("light")}
                  className={`p-2 rounded-lg flex items-center space-x-1 ${
                    theme === "light"
                      ? "bg-primary text-black"
                      : "bg-gray-100 text-black"
                  }`}
                >
                  <Sun size={16} />
                  <span>Light</span>
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={`p-2 rounded-lg flex items-center space-x-1 ${
                    theme === "dark"
                      ? "bg-primary text-black"
                      : "bg-gray-100 text-black"
                  }`}
                >
                  <Moon size={16} />
                  <span>Dark</span>
                </button>
                <button
                  onClick={() => setTheme("system")}
                  className={`p-2 rounded-lg flex items-center space-x-1 ${
                    theme === "system"
                      ? "bg-primary text-black"
                      : "bg-gray-100 text-black"
                  }`}
                >
                  <Monitor size={16} />
                  <span>System</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 border border-primary rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Network</h2>
          <p className="text-gray-600">Connected to Sepolia Testnet</p>
        </div>
        <div className="p-4 border border-primary rounded-lg">
          <h2 className="text-xl font-semibold mb-2">App Info</h2>
          <p className="text-gray-600">Version: {version}</p>
          {updateAvailable && (
            <button
              onClick={updateApp}
              className="mt-2 w-full p-2 bg-primary text-black rounded"
            >
              Update Available
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
