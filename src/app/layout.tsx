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
  openGraph: {
    title: "MemeAgent",
    url: "https://memeagent.club/",
    description: "MemeAgent",
    images: [
      {
        url: "https://memeagent.club/og-image.png",
        secureUrl: "https://memeagent.club/og-image.png",
        alt: "MemeAgent",
        width: 1200,
        height: 630,
        type: "image/png",
      },
    ],
    locale: "en-US",
    type: "website",
  },
  alternates: {
    canonical: "https://memeagent.club/",
  },
  twitter: {
    card: "summary_large_image",
    title: "MemeAgent",
    description: "MemeAgent",
    creator: "@MemeAgent",
    images: ["https://memeagent.club/og-image.png"],
  },
  robots: {
    index: true,
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
          " bg-gradient-r min-h-screen text-foreground max-w-xl mx-auto md:border-x border-primary"
        }
      >
        <Providers>
          <div className="bg-gradient-b min-h-screen">{children}</div>
          <InstallPrompt />
          <Toaster position="bottom-center" />
        </Providers>
      </body>
    </html>
  );
}
