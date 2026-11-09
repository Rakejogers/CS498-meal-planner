import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

// The logo's ingredients as loose shapes: they drop into the hero's basket button and float
// around the closing panel. Decorative, so always inside something `aria-hidden`.

type Props = ComponentProps<"svg">;

export function Leaves({ className, ...props }: Props) {
  return (
    <svg viewBox="0 0 40 44" className={cn("fill-sage", className)} {...props}>
      <path d="M14 44C2 31 1 13 8 1c14 7 20 23 14 43Z" />
      <path d="M26 44c-2-12 2-22 12-27 3 10-1 21-8 27Z" />
    </svg>
  );
}

export function Jar({ className, ...props }: Props) {
  return (
    <svg viewBox="0 0 26 40" className={cn("fill-saffron", className)} {...props}>
      <rect x="4" width="18" height="6" rx="3" />
      <rect x="1" y="9" width="24" height="31" rx="6" />
    </svg>
  );
}

export function Baguette({ className, ...props }: Props) {
  return (
    <svg viewBox="0 0 20 64" className={cn("fill-saffron-ink", className)} {...props}>
      <rect x="1" y="1" width="18" height="62" rx="9" />
      <path
        d="m6 14 8 4M6 25l8 4M6 36l8 4"
        className="fill-none stroke-saffron-soft stroke-2 [stroke-linecap:round]"
      />
    </svg>
  );
}

export function Eggplant(props: Props) {
  return (
    <svg viewBox="0 0 28 48" {...props}>
      <path
        d="M14 12c8 0 12 9 12 20 0 9-5 15-12 15S2 41 2 32c0-11 4-20 12-20Z"
        className="fill-plum"
      />
      <path
        d="M12 4a2 2 0 0 1 4 0v6c3 0 5 1 6 4-4 3-12 3-16 0 1-3 3-4 6-4Z"
        className="fill-sage-ink"
      />
    </svg>
  );
}

export function Tomato(props: Props) {
  return (
    <svg viewBox="0 0 30 30" {...props}>
      <circle cx="15" cy="18" r="12" className="fill-tomato" />
      <path d="m15 10-6-3 4.5-.5L15 2l1.5 4.5L21 7Z" className="fill-sage-ink" />
    </svg>
  );
}
