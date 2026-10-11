"use client";

import { ChevronDown, LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const ITEM =
  "flex h-10 w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 text-sm font-medium transition-colors outline-none hover:bg-secondary focus-visible:bg-secondary [&_svg]:size-4 [&_svg]:text-muted-foreground";

/** The signed-in header's account button and the menu it opens. */
export function AccountMenu({ name, email }: { name: string; email: string }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const closeOnOutsidePress = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsidePress);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePress);
  }, [open]);

  return (
    <div
      ref={root}
      className="relative"
      onKeyDown={(event) => {
        if (event.key !== "Escape" || !open) return;
        setOpen(false);
        trigger.current?.focus();
      }}
      onBlur={(event) => {
        // Tabbing past the last item closes the menu.
        if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false);
        }
      }}
    >
      <button
        ref={trigger}
        type="button"
        aria-expanded={open}
        aria-controls="account-menu"
        onClick={() => setOpen((shown) => !shown)}
        className={cn(
          "flex h-10 cursor-pointer items-center gap-2 rounded-full border border-input bg-card pr-2.5 pl-1 text-sm font-medium shadow-xs transition-all outline-none hover:border-primary/40 hover:bg-secondary focus-visible:ring-4 focus-visible:ring-ring/20 active:scale-[0.98]",
          open && "border-primary/40 bg-secondary",
        )}
      >
        <span
          aria-hidden
          className="grid size-8 place-items-center rounded-full bg-saffron-soft font-semibold text-saffron-ink uppercase"
        >
          {name.charAt(0)}
        </span>
        <span className="hidden max-w-40 truncate sm:block">{name}</span>
        <span className="sr-only">Account menu</span>
        <ChevronDown
          aria-hidden
          className={cn(
            "size-4 text-muted-foreground transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div
          id="account-menu"
          className="absolute top-full right-0 z-40 mt-2 w-60 origin-top-right animate-pop-in rounded-2xl border bg-card p-1.5 shadow-lg shadow-foreground/5"
        >
          <p className="truncate px-3 pt-2 pb-2.5 text-xs text-muted-foreground">
            Signed in as <span className="font-medium text-foreground">{email}</span>
          </p>
          <div className="border-t pt-1.5">
            <Link href="/settings" className={ITEM} onClick={() => setOpen(false)}>
              <Settings />
              Settings
            </Link>
            <form action="/auth/signout" method="post">
              <button type="submit" className={ITEM}>
                <LogOut />
                Sign out
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
