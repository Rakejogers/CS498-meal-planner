import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * The save row at the bottom of a settings form. It stays pinned to the
 * bottom of the screen so saving never needs a scroll.
 */
export function SaveBar({
  label,
  savedMessage,
  pending,
  edited,
  saved,
  error,
}: {
  label: string;
  savedMessage: string;
  pending: boolean;
  /** Something changed since the last save. */
  edited: boolean;
  saved?: boolean;
  error?: string;
}) {
  return (
    <div className="sticky bottom-0 z-10 -mx-6 mt-10 flex flex-wrap items-center gap-x-4 gap-y-2 border-t bg-background/95 px-6 py-4 backdrop-blur-md">
      <Button type="submit" size="lg" className="min-w-44" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : label}
      </Button>
      {error ? (
        <p
          role="alert"
          className="animate-fade-up rounded-2xl bg-tomato-soft px-4 py-3 text-sm text-tomato-ink"
        >
          {error}
        </p>
      ) : saved && !edited && !pending ? (
        <p
          role="status"
          className="flex animate-fade-up items-center gap-1.5 text-sm font-medium text-sage-ink"
        >
          <Check className="size-4" />
          {savedMessage}
        </p>
      ) : (
        edited &&
        !pending && (
          <p className="flex animate-fade-up items-center gap-2 text-sm text-muted-foreground">
            <span aria-hidden className="size-2 rounded-full bg-saffron" />
            Unsaved changes
          </p>
        )
      )}
    </div>
  );
}
