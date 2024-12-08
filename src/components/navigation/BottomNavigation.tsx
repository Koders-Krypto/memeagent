"use client";

import {
  Home,
  ArrowLeftRight,
  Wallet,
  Settings,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navigationItems = [
  {
    name: "Home",
    href: "/dashboard",
    icon: Home,
  },
  {
    name: "Wallet",
    href: "/wallet",
    icon: Wallet,
  },
  {
    name: "Trade",
    href: "/trade",
    icon: ArrowLeftRight,
  },
  {
    name: "Chat",
    href: "/chat",
    icon: MessageSquare,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-transparent border-primary  max-w-xl mx-auto md:border-x w-full p-4">
      <div className="grid h-full grid-cols-5 justify-center items-center w-full border rounded-full border-primary shadow-lg">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "inline-flex flex-col items-center justify-center p-4 first:rounded-l-full last:rounded-r-full",
                isActive && "text-primary bg-gray-800"
              )}
            >
              <Icon
                className={cn(
                  "w-7 h-7",
                  isActive ? "text-primary" : "text-gray-500"
                )}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
