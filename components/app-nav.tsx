"use client";

import { CalendarDays, ShoppingBasket } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function AppNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Main navigation" className="order-3 flex w-full gap-1 sm:order-none sm:w-auto">
      {[
        { href: "/dashboard", label: "Your week", icon: CalendarDays },
        { href: "/groceries", label: "Groceries", icon: ShoppingBasket },
      ].map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          aria-current={pathname === href ? "page" : undefined}
          className={cn(
            "inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors outline-none focus-visible:ring-4 focus-visible:ring-ring/20",
            pathname === href
              ? "bg-accent text-primary"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground",
          )}
        >
          <Icon className="size-4" aria-hidden="true" />
          {label}
        </Link>
      ))}
    </nav>
  );
}
