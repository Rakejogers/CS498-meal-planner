import { Badge, type Tone } from "@/components/ui/badge";
import { PANTRY_STATES, type PantryState } from "@/lib/pantry";

const TONES: Record<PantryState, Tone> = {
  have: "sage",
  low: "saffron",
  out: "tomato",
  unsure: "plum",
};

/** The Have / Running low / Out / Unsure label. Color is never the only signal. */
export function PantryStateBadge({ state }: { state: PantryState }) {
  const option = PANTRY_STATES.find((item) => item.value === state) ?? PANTRY_STATES[0];
  return <Badge tone={TONES[state]}>{option.label}</Badge>;
}
