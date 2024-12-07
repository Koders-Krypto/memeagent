"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWeb3Auth } from "@/providers/Web3Provider";
import { useAuthStore } from "@/store/useAuthStore";
import { Loader2 } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { motion } from "framer-motion";
import TypingAnimation from "@/components/ui/typing-animation";

export default function LoginPage() {
  const router = useRouter();
  const { login, loggedIn, address } = useWeb3Auth();
  const { isAuthenticated, initialized } = useAuthStore();

  useEffect(() => {
    if (initialized && isAuthenticated && loggedIn && address) {
      router.replace("/dashboard");
    }
  }, [initialized, isAuthenticated, loggedIn, address, router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-b relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center gap-8 text-center"
      >
        <div className=" flex flex-col items-center gap-12 justify-center max-w-xs md:max-w-4xl">
          <div className="flex flex-col justify-center items-center gap-6 md:gap-8 text-center">
            <Logo width={380} height={380} animate={true} />

            <h1 className="text-2xl font-medium text-center text-white max-w-4xl">
              <TypingAnimation
                duration={20}
                className="text-2xl md:text-3xl font-bold text-black dark:text-white"
                text="Revolutionizing memecoin creation, trading, and sniping with AI-powered precision."
              />
            </h1>
          </div>

          <button
            onClick={login}
            className=" px-6 py-3 bg-primary text-black font-bold text-xl rounded-lg"
          >
            {initialized ? "Connect Wallet" : <Loader2 className="animate-spin h-8 w-8 text-primary" />}
          </button>
        </div>
      </motion.div>
      <footer className=" mx-auto px-4 py-2 mt-16 text-center text-gray-600 dark:text-gray-400 absolute bottom-2 flex justify-center items-center text-lg">
        <p>Made with 💚 2024 at ETHIndia 🇮🇳</p>
      </footer>
    </div>
  );
}
