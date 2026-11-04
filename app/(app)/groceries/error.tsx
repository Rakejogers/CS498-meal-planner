"use client";

import { Button } from "@/components/ui/button";

export default function GroceryError({ reset }: { reset: () => void }) {
  return (
    <div className="mx-auto max-w-md py-12 text-center">
      <h1 className="font-display text-3xl font-medium">Your list needs a moment.</h1>
      <p role="alert" className="mt-4 text-muted-foreground">
        We couldn&apos;t load your saved meals. Please try again.
      </p>
      <Button className="mt-6" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
