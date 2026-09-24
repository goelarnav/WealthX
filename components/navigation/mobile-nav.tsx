"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { Home, Briefcase, LayoutGrid, User } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/dashboard", label: "Home", icon: Home, match: ["/dashboard", "/recommendations"] },
  { href: "/portfolio", label: "My Stocks", icon: Briefcase, match: ["/portfolio"] },
  { href: "/calculators", label: "More", icon: LayoutGrid, match: ["/calculators"] },
  { href: "/profile", label: "Profile", icon: User, match: ["/profile"] },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-6xl items-stretch">
        {TABS.map((tab) => {
          const isActive = tab.match.some((prefix) => pathname.startsWith(prefix));
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="relative flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium"
            >
              {isActive && (
                <motion.span
                  layoutId="mobile-nav-indicator"
                  className="absolute top-0 h-0.5 w-10 rounded-full bg-teal-600"
                  transition={{ duration: 0.2 }}
                />
              )}
              <tab.icon
                className={cn("size-5", isActive ? "text-teal-700" : "text-muted-foreground")}
                strokeWidth={isActive ? 2.25 : 2}
              />
              <span className={isActive ? "text-foreground" : "text-muted-foreground"}>{tab.label}</span>
            </Link>
          );
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
