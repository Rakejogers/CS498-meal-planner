"use client";

import { Check, Loader2, MapPin, Search } from "lucide-react";
import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { KrogerStore } from "@/lib/kroger/stores";
import { chooseStore, findStores, type ChooseStoreState, type FindStoresState } from "./actions";

const errorBox = "animate-fade-up rounded-2xl bg-tomato-soft px-4 py-3 text-sm text-tomato-ink";

export function StorePicker({ current }: { current: KrogerStore | null }) {
  const [found, findAction, finding] = useActionState<FindStoresState, FormData>(findStores, {});
  const [chosen, chooseAction, choosing] = useActionState<ChooseStoreState, FormData>(
    chooseStore,
    {},
  );
  const [searching, setSearching] = useState(current === null);
  // Which store's button was pressed, for its spinner.
  const [choosingId, setChoosingId] = useState<string | null>(null);

  // Close the search once a store is saved. The page re-renders with it as `current`.
  const [lastChosen, setLastChosen] = useState(chosen);
  if (chosen !== lastChosen) {
    setLastChosen(chosen);
    if (chosen.saved) setSearching(false);
  }

  return (
    <div className="rounded-3xl border bg-card p-5 shadow-[0_1px_2px_rgba(28,41,32,0.04),0_8px_24px_-12px_rgba(28,41,32,0.08)] sm:p-6">
      {current ? (
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-sky-soft text-sky-ink">
              <MapPin className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="font-medium break-words">{current.name}</p>
              <p className="text-sm break-words text-muted-foreground">{current.address}</p>
            </div>
          </div>
          {!searching && (
            <Button variant="outline" size="sm" onClick={() => setSearching(true)}>
              Change store
            </Button>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No store yet. Search by ZIP code to find one near you.
        </p>
      )}

      {chosen.saved && !searching && (
        <p
          role="status"
          className="mt-4 flex animate-fade-up items-center gap-1.5 text-sm font-medium text-sage-ink"
        >
          <Check className="size-4" />
          Saved. Groceries will be matched to this store.
        </p>
      )}

      {searching && (
        <div className={current ? "mt-5 border-t pt-5" : "mt-4"}>
          <form action={findAction} className="flex flex-wrap items-end gap-3">
            <div className="min-w-40 flex-1 sm:max-w-56">
              <Label htmlFor="zipCode">ZIP code</Label>
              <Input
                id="zipCode"
                name="zipCode"
                inputMode="numeric"
                autoComplete="postal-code"
                maxLength={5}
                placeholder="45202"
                defaultValue={found.zipCode}
                aria-invalid={found.error ? true : undefined}
                className="mt-1.5"
                required
              />
            </div>
            <Button type="submit" disabled={finding}>
              {finding ? <Loader2 className="animate-spin" /> : <Search />}
              Find stores
            </Button>
            {current && (
              <Button type="button" variant="ghost" onClick={() => setSearching(false)}>
                Cancel
              </Button>
            )}
          </form>

          {found.error && (
            <p role="alert" className={`mt-4 ${errorBox}`}>
              {found.error}
            </p>
          )}
          {chosen.error && (
            <p role="alert" className={`mt-4 ${errorBox}`}>
              {chosen.error}
            </p>
          )}

          {found.stores && found.stores.length === 0 && (
            <p role="status" className="mt-4 text-sm text-muted-foreground">
              No Kroger stores within 15 miles of {found.zipCode}. Try a nearby ZIP code.
            </p>
          )}

          {found.stores && found.stores.length > 0 && (
            <ul aria-label="Stores near you" className="mt-5 divide-y rounded-2xl border">
              {found.stores.map((store) => {
                const isCurrent = store.locationId === current?.locationId;
                return (
                  <li
                    key={store.locationId}
                    className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="font-medium break-words">{store.name}</p>
                      <p className="text-sm break-words text-muted-foreground">{store.address}</p>
                    </div>
                    {isCurrent ? (
                      <span className="flex items-center gap-1.5 text-sm font-medium text-sage-ink">
                        <Check className="size-4" />
                        Your store
                      </span>
                    ) : (
                      <form
                        action={(formData) => {
                          setChoosingId(store.locationId);
                          chooseAction(formData);
                        }}
                      >
                        <input type="hidden" name="locationId" value={store.locationId} />
                        <Button
                          type="submit"
                          variant="outline"
                          size="sm"
                          disabled={choosing}
                          aria-label={`Choose ${store.name}, ${store.address}`}
                        >
                          {choosing && choosingId === store.locationId ? (
                            <Loader2 className="animate-spin" />
                          ) : (
                            "Choose"
                          )}
                        </Button>
                      </form>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
