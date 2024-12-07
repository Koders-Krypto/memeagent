"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Logo } from "@/components/common/Logo";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect } from "react";
import Link from "next/link";
import TypingAnimation from "@/components/ui/typing-animation";

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated, initialized } = useAuthStore();

  useEffect(() => {
    // Only redirect if initialized and authenticated
    if (initialized && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [initialized, isAuthenticated, router]);

  // If not initialized or not authenticated, show landing page
  return (
    <div className="min-h-screen flex flex-col gap-4 justify-center items-center bg-gradient-b relative">
      {/* Header */}

      <div className="flex flex-col gap-8 justify-center items-center text-center max-w-4xl">
        <Logo />
        <h1 className="text-2xl font-medium text-center text-white">
          <TypingAnimation
            duration={20}
            className="text-3xl font-bold text-black dark:text-white"
            text="Revolutionizing memecoin creation, trading, and sniping with AI-powered precision."
          />
        </h1>
        <Link
          href={"/login"}
          className="bg-primary px-8 py-2.5 font-bold text-xl mt-12 rounded-full shadow-md text-background"
        >
          Launch App
        </Link>
      </div>
      {/* Hero Section */}
      <footer className=" mx-auto px-4 py-2 mt-16 text-center text-gray-600 dark:text-gray-400 absolute bottom-2 flex justify-center items-center text-lg">
        <p>Made with 💚 2024 at ETHIndia 🇮🇳</p>
      </footer>
      {/* Footer */}
    </div>
  );
}
