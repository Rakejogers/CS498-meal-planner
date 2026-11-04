"use client";

import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

export function RestartButton({
  intent,
  variant,
  children,
}: {
  intent: "keep" | "fresh";
  variant?: "default" | "outline";
  children: ReactNode;
}) {
  const { pending, data } = useFormStatus();
  const mine = pending && data?.get("intent") === intent;
  return (
    <Button
      type="submit"
      name="intent"
      value={intent}
      variant={variant}
      size="sm"
      disabled={pending}
    >
      {mine ? <Loader2 className="animate-spin" /> : children}
    </Button>
  );
}
