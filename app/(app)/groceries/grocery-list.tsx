"use client";

import { Copy, ShoppingBasket } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatGroceryAmount, groceryListText, type GroceryItem } from "@/lib/groceries";

export function GroceryList({ items, mealCount }: { items: GroceryItem[]; mealCount: number }) {
  const [copyStatus, setCopyStatus] = useState("");
  async function copyList() {
    try {
      await navigator.clipboard.writeText(groceryListText(items));
      setCopyStatus("Grocery list copied.");
    } catch {
      setCopyStatus("Couldn't copy the list. You can select and copy the ingredients below.");
    }
  }
  return (
    <Card className="overflow-hidden">
      <div className="border-b bg-sage-soft/50 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium tracking-wider text-sage-ink uppercase">
              All your meals, together
            </p>
            <h2 className="mt-2 font-display text-2xl font-medium">Your combined list</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {items.length} {items.length === 1 ? "ingredient" : "ingredients"} from {mealCount}{" "}
              {mealCount === 1 ? "meal" : "meals"}
            </p>
          </div>
          {items.length > 0 && (
            <Button variant="outline" onClick={copyList}>
              <Copy aria-hidden="true" /> Copy list
            </Button>
          )}
        </div>
        <p role="status" className="mt-2 text-sm text-primary">
          {copyStatus}
        </p>
      </div>
      {items.length ? (
        <>
          <ul aria-label="Combined grocery requirements" className="divide-y px-6">
            {items.map((item) => (
              <li key={item.name} className="py-5">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="min-w-0 font-medium wrap-anywhere capitalize">{item.name}</h3>
                  <p className="font-medium text-primary">
                    {item.amounts.map(formatGroceryAmount).join(" + ")}
                  </p>
                </div>
                <p className="mt-1 text-xs leading-relaxed wrap-anywhere text-muted-foreground">
                  For {item.meals.map(({ title }) => title).join(" · ")}
                </p>
              </li>
            ))}
          </ul>
          <div className="space-y-2 border-t bg-muted/40 p-6 text-xs leading-relaxed text-muted-foreground">
            <p>
              Compatible amounts are added together. Weight and volume stay separate; cups and
              spoons use US measures.
            </p>
            <p>These are the full recipe requirements. Check your kitchen before shopping.</p>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center px-6 py-14 text-center">
          <div className="mb-5 flex size-16 items-center justify-center rounded-3xl bg-sage-soft text-sage-ink">
            <ShoppingBasket className="size-7" aria-hidden="true" />
          </div>
          <h3 className="font-display text-2xl font-medium">Good meals start here.</h3>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
            {mealCount === 0
              ? "Add a meal and include it in your list. We'll gather the ingredients and do the adding up."
              : "Your ingredients will appear here."}
          </p>
        </div>
      )}
    </Card>
  );
}
