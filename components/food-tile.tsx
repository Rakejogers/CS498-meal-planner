import type { LucideIcon } from "lucide-react";
import type { Tone } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const tones: Record<Tone, string> = {
  neutral: "bg-muted text-muted-foreground",
  sage: "bg-sage-soft text-sage-ink",
  saffron: "bg-saffron-soft text-saffron-ink",
  tomato: "bg-tomato-soft text-tomato-ink",
  plum: "bg-plum-soft text-plum-ink",
  sky: "bg-sky-soft text-sky-ink",
};

/** A soft, colored square holding a food icon. Stands in for meal photos. */
export function FoodTile({
  icon: Icon,
  tone = "sage",
  className,
}: {
  icon: LucideIcon;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "grid size-11 shrink-0 place-items-center rounded-2xl",
        tones[tone],
        className,
      )}
    >
      <Icon className="size-5" strokeWidth={2} />
    </span>
  );
}
