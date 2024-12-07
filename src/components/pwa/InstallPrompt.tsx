"use client";

import { usePWA } from "@/providers/PWAProvider";
import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function InstallPrompt() {
  const { isInstallable, installApp, isInstalled } = usePWA();
  const [dismissed, setDismissed] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (isInstallable && !isInstalled && !dismissed) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled, dismissed]);

  if (!showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-20 left-4 right-4 z-50"
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border dark:border-gray-700 mx-auto max-w-md">
          <button
            onClick={() => {
              setDismissed(true);
              setShowPrompt(false);
            }}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={20} />
          </button>
          <div className="flex flex-col items-center text-center">
            <h3 className="font-semibold text-lg mb-2 dark:text-white">
              Install MemeAgent
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Install our app for enhanced security and faster access!
            </p>
            <button
              onClick={() => {
                installApp();
                setShowPrompt(false);
              }}
              className="w-full py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Install App
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
