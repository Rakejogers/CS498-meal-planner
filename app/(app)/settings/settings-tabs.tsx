"use client";

import { Salad, UsersRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

// One entry per settings tab. Each tab is a page at app/(app)/settings/<name>/.
const TABS = [
  { href: "/settings/preferences", label: "Food preferences", icon: Salad },
  { href: "/settings/household", label: "Household", icon: UsersRound },
];

export function SettingsTabs() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Settings"
      className="flex animate-fade-up flex-wrap gap-1.5 self-start lg:sticky lg:top-24 lg:flex-col"
    >
      {TABS.map(({ href, label, icon: Icon }) => {
        const current = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={current ? "page" : undefined}
            className={cn(
              "group flex h-11 items-center gap-2.5 rounded-full border px-4 text-sm font-medium transition-all outline-none focus-visible:ring-4 focus-visible:ring-ring/20 active:scale-[0.98] lg:rounded-2xl lg:px-3",
              current
                ? "border-border bg-card text-foreground shadow-xs"
                : "border-transparent text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            <Icon
              className={cn(
                "size-4 transition-colors",
                current ? "text-primary" : "group-hover:text-foreground",
              )}
            />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
