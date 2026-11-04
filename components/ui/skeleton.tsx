import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/** A placeholder block with a soft shimmer, shaped by `className`. Hidden from screen readers. */
export function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      aria-hidden
      className={cn(
        "animate-shimmer rounded-xl bg-[linear-gradient(100deg,var(--color-secondary)_30%,color-mix(in_oklab,var(--color-secondary)_55%,var(--color-card))_50%,var(--color-secondary)_70%)] bg-size-[200%_100%]",
        className,
      )}
      {...props}
    />
  );
}
