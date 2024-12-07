import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/providers";
import { Toaster } from "react-hot-toast";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";

import Inter from "./fonts/ComicNeue";

export const metadata: Metadata = {
  title: "MemeAgent",
  description:
    "Revolutionizing memecoin creation, trading, and sniping with AI-powered precision.",
  manifest: "/manifest.json",
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={
          Inter.className +
          " bg-background text-foreground max-w-xl mx-auto md:border-x border-primary"
        }
      >
        <Providers>
          {children}
          <InstallPrompt />
          <Toaster position="bottom-center" />
        </Providers>
      </body>
    </html>
  );
}
