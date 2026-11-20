"use client";

import { ExternalLink, Loader2, ShoppingCart } from "lucide-react";
import { useActionState, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { KROGER_CART_URL } from "@/lib/kroger/approval";
import type { GroceryProductMatch } from "@/lib/kroger/grocery-match";
import { cn, sentenceCase } from "@/lib/utils";
import { addApprovedGroceries, type CartFormState } from "./actions";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

function productPrice(match: GroceryProductMatch) {
  const price = match.product?.promoPrice ?? match.product?.price;
  return price == null ? null : money.format(price);
}

/**
 * The products the user has reviewed. Checked ones are approved for the
 * Kroger cart; unchecked ones are left out. Unmatched ingredients can't be checked.
 */
export function KrogerCart({
  planId,
  matches,
  connected,
}: {
  planId: string;
  matches: GroceryProductMatch[] | null;
  connected: boolean;
}) {
  const matched = matches?.filter((match) => match.product) ?? [];
  const unmatched = matches?.filter((match) => !match.product) ?? [];
  const [approved, setApproved] = useState(() => new Set(matched.map((match) => match.name)));
  const [state, formAction, pending] = useActionState<CartFormState, FormData>(
    addApprovedGroceries,
    {},
  );

  const chosen = matched.filter((match) => approved.has(match.name) && match.product);
  const payload = chosen.map((match) => ({ name: match.name, upc: match.product!.upc }));

  const toggle = (name: string) => {
    setApproved((current) => {
      const next = new Set(current);
      if (!next.delete(name)) next.add(name);
      return next;
    });
  };

  if (!matches) {
    return (
      <Card className="p-6">
        <h2 className="font-display text-lg font-medium">Kroger cart</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Choose your Kroger store, then review the matched products here before anything is added
          to your cart.
        </p>
        <a href="/settings/kroger" className={cn(buttonVariants({ size: "sm" }), "mt-4")}>
          Choose a store
        </a>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="font-display text-lg font-medium">Kroger cart</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Approve the products to send. Anything you uncheck, or that has no match, stays out of the
        cart. Checkout happens on Kroger.
      </p>

      {matched.length > 0 && (
        <ul aria-label="Products to approve" className="mt-4 divide-y">
          {matched.map((match) => {
            const checked = approved.has(match.name);
            const price = productPrice(match);
            return (
              <li key={match.name}>
                <label className="flex cursor-pointer items-start gap-3 py-3">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(match.name)}
                    className="mt-0.5 size-4 accent-primary"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium wrap-anywhere">
                      {sentenceCase(match.name)}
                    </span>
                    <span className="mt-0.5 block text-xs wrap-anywhere text-muted-foreground">
                      {[match.product?.brand, match.product?.name, match.product?.size]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </span>
                  {price && (
                    <span className="shrink-0 text-sm font-medium text-primary tabular-nums">
                      {price}
                    </span>
                  )}
                </label>
              </li>
            );
          })}
        </ul>
      )}

      {unmatched.length > 0 && (
        <div className="mt-4 rounded-2xl bg-saffron-soft px-4 py-3 text-sm text-saffron-ink">
          <p className="font-medium">
            {unmatched.length === 1
              ? "1 item still needs a product"
              : `${unmatched.length} items still need a product`}
          </p>
          <p className="mt-1">
            {unmatched.map((match) => sentenceCase(match.name)).join(", ")}. These won&apos;t be
            added.
          </p>
        </div>
      )}

      {state.error && !pending && (
        <p role="alert" className="mt-4 text-sm text-tomato-ink">
          {state.error}
        </p>
      )}
      {state.added != null && !pending && (
        <p role="status" className="mt-4 text-sm text-sage-ink">
          Added {state.added} {state.added === 1 ? "product" : "products"} to your Kroger cart.
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {connected ? (
          <form action={formAction}>
            <input type="hidden" name="planId" value={planId} />
            <input type="hidden" name="items" value={JSON.stringify(payload)} />
            <Button type="submit" size="sm" disabled={pending || payload.length === 0}>
              {pending ? <Loader2 className="animate-spin" /> : <ShoppingCart aria-hidden="true" />}
              {pending ? "Adding…" : `Add ${payload.length} to cart`}
            </Button>
          </form>
        ) : (
          <a href="/api/kroger/connect?next=/groceries" className={buttonVariants({ size: "sm" })}>
            Connect Kroger
          </a>
        )}
        {state.added != null && (
          <a
            href={KROGER_CART_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Review cart on Kroger <ExternalLink aria-hidden="true" />
          </a>
        )}
      </div>
    </Card>
  );
}
