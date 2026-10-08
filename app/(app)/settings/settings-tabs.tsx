"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

// One entry per settings tab. Each tab is a page at app/(app)/settings/<name>/.
const TABS = [
  { href: "/settings/preferences", label: "Food preferences" },
  { href: "/settings/household", label: "Household" },
];

export function SettingsTabs() {
  const pathname = usePathname();

  return (
    <nav aria-label="Settings" className="mt-8 flex gap-1 overflow-x-auto border-b">
      {TABS.map(({ href, label }) => {
        const current = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={current ? "page" : undefined}
            className={cn(
              "-mb-px border-b-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors",
              current
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
