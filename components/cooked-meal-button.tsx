import { Check } from "lucide-react";
import { markMealCooked } from "@/app/(app)/meals/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/** Records that this dinner was cooked and removes its amounts from the pantry once. */
export function CookedMealButton({ id, cooked }: { id: string; cooked: boolean }) {
  if (cooked) {
    return (
      <Badge tone="sage">
        <Check aria-hidden /> Made
      </Badge>
    );
  }

  return (
    <form action={markMealCooked} className="relative z-10">
      <input type="hidden" name="id" value={id} />
      <Button type="submit" size="sm" variant="outline">
        I made this
      </Button>
    </form>
  );
}
