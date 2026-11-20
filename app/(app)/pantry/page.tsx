import type { Metadata } from "next";
import { getPantryItems } from "@/lib/data";
import { PantryBoard } from "./pantry-board";

export const metadata: Metadata = { title: "Pantry" };

export default async function PantryPage() {
  const items = await getPantryItems();

  return (
    <div className="animate-fade-up">
      <h1 className="font-display text-4xl font-medium sm:text-5xl">Your pantry</h1>
      <p className="mt-3 max-w-xl text-lg text-muted-foreground">
        Keep track of what you already have, how much is left, and when you bought, opened, or need
        to use it.
      </p>
      <PantryBoard items={items} />
    </div>
  );
}
