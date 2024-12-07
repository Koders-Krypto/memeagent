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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-primary">
      <div className="grid h-full max-w-lg grid-cols-5 justify-center items-center mx-auto">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "inline-flex flex-col items-center justify-center px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800",
                isActive && "text-primary"
              )}
            >
              <Icon
                className={cn(
                  "w-6 h-6",
                  isActive ? "text-primary" : "text-gray-500"
                )}
              />
              <span
                className={cn(
                  "text-xs mt-1",
                  isActive ? "text-primary" : "text-gray-500"
                )}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
