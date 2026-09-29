import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-12 w-full rounded-xl border border-input bg-card px-4 text-[15px] shadow-xs transition-[border-color,box-shadow] outline-none placeholder:text-muted-foreground/70 focus-visible:border-primary/60 focus-visible:ring-4 focus-visible:ring-primary/10 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/10",
        className,
      )}
      {...props}
    />
  );
}
