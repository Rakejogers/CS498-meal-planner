import { Badge, type Tone } from "@/components/ui/badge";
import type { Enums } from "@/lib/supabase/database.types";

export const PANTRY_STATES: Record<
  Enums<"pantry_state">,
  { label: string; tone: Tone }
> = {
  have: { label: "Have", tone: "sage" },
  low: { label: "Running low", tone: "saffron" },
  out: { label: "Out", tone: "tomato" },
  unsure: { label: "Unsure", tone: "plum" },
};

export function PantryStateBadge({ state }: { state: Enums<"pantry_state"> }) {
  const { label, tone } = PANTRY_STATES[state];
  return (
    <Badge tone={tone}>
      <span className="size-1.5 rounded-full bg-current" />
      {label}
    </Badge>
  );
}
