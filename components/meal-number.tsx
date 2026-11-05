import { cn } from "@/lib/utils";

// Each dinner in a plan keeps the same number and color everywhere it shows
// up, so a grocery item's dots point back to the dinner cards.
const TONES = [
  "bg-sage-soft text-sage-ink",
  "bg-saffron-soft text-saffron-ink",
  "bg-tomato-soft text-tomato-ink",
  "bg-plum-soft text-plum-ink",
  "bg-sky-soft text-sky-ink",
];

/** The numbered dot for the dinner at `position` (0 is the first). Decorative: say the title nearby. */
export function MealNumber({
  position,
  size = "md",
  className,
}: {
  position: number;
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-grid shrink-0 place-items-center rounded-full font-semibold tabular-nums",
        size === "sm" ? "size-5 text-[0.65rem]" : "size-8 text-sm",
        TONES[position % TONES.length],
        className,
      )}
    >
      {position + 1}
    </span>
  );
}
