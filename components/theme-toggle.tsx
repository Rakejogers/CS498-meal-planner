"use client";

import { Moon, Sun } from "lucide-react";
import { useLayoutEffect } from "react";
import { Button } from "@/components/ui/button";
import { toggleTheme, watchTheme } from "@/lib/theme";

/**
 * Keeps the theme current on every page. Also restores it after React's dev-only
 * remount, which clears the class THEME_SCRIPT put on <html>.
 */
export function ThemeSync() {
  useLayoutEffect(() => watchTheme(), []);
  return null;
}

/** The header's light/dark button. CSS picks the icon and label, so it can't mismatch on load. */
export function ThemeToggle() {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="text-muted-foreground hover:border-primary/40 hover:text-foreground"
    >
      <Moon aria-hidden className="dark:hidden" />
      <Sun aria-hidden className="hidden dark:block" />
      <span className="sr-only dark:hidden">Switch to dark mode</span>
      <span className="sr-only hidden dark:inline">Switch to light mode</span>
    </Button>
  );
}
