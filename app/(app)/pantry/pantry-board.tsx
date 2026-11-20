"use client";

import { Loader2, Plus, Trash2 } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { PantryStateBadge } from "@/components/pantry-state-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatGroceryAmount } from "@/lib/groceries";
import { UNITS } from "@/lib/meal-plan";
import { formatPantryDate, PANTRY_STATES, type PantryItem } from "@/lib/pantry";
import { cn, sentenceCase } from "@/lib/utils";
import {
  changePantryState,
  createPantryItem,
  removePantryItem,
  savePantryItem,
  type PantryFormState,
} from "./actions";

const fieldClass =
  "h-12 w-full rounded-xl border border-input bg-card px-4 text-[15px] shadow-xs outline-none focus-visible:border-primary/60 focus-visible:ring-4 focus-visible:ring-primary/10";

export function PantryBoard({ items }: { items: PantryItem[] }) {
  return (
    <div className="mt-9 grid items-start gap-8 lg:grid-cols-[22rem_minmax(0,1fr)]">
      <AddPantryItem />
      <PantryItems items={items} />
    </div>
  );
}

function AddPantryItem() {
  const [state, action, pending] = useActionState<PantryFormState, FormData>(createPantryItem, {});
  const [formKey, setFormKey] = useState(0);
  const [seen, setSeen] = useState(state);
  if (state !== seen) {
    setSeen(state);
    if (state.saved) setFormKey((key) => key + 1);
  }

  return (
    <Card className="p-6 lg:sticky lg:top-24">
      <h2 className="font-display text-2xl font-medium">Add an ingredient</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Dates are optional when you don&apos;t know them yet.
      </p>
      <form key={formKey} action={action} className="mt-5 space-y-4">
        <PantryFields />
        {state.error && <FormError message={state.error} />}
        {state.saved && (
          <p role="status" className="text-sm font-medium text-sage-ink">
            Added to your pantry.
          </p>
        )}
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="animate-spin" /> : <Plus />}
          Add to pantry
        </Button>
      </form>
    </Card>
  );
}

function PantryItems({ items }: { items: PantryItem[] }) {
  const [editing, setEditing] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <Card className="p-8">
        <h2 className="font-display text-2xl font-medium">Nothing saved yet.</h2>
        <p className="mt-2 max-w-md text-muted-foreground">
          Add the first ingredient you already have. It will still be here the next time you open
          your pantry.
        </p>
      </Card>
    );
  }

  return (
    <ul aria-label="Pantry items" className="space-y-4">
      {items.map((item) => (
        <li key={item.id}>
          <Card className="p-5 sm:p-6">
            {editing === item.id ? (
              <EditPantryItem item={item} onDone={() => setEditing(null)} />
            ) : (
              <PantryItemSummary item={item} onEdit={() => setEditing(item.id)} />
            )}
          </Card>
        </li>
      ))}
    </ul>
  );
}

function PantryItemSummary({ item, onEdit }: { item: PantryItem; onEdit: () => void }) {
  const dates = [
    item.boughtOn ? `Bought ${formatPantryDate(item.boughtOn)}` : null,
    item.openedOn ? `Opened ${formatPantryDate(item.openedOn)}` : null,
    item.expiresOn ? `Expires ${formatPantryDate(item.expiresOn)}` : null,
  ].filter((date) => date !== null);

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-medium wrap-anywhere">
            {sentenceCase(item.name)}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {item.unit === "each" ? `${formatGroceryAmount(item)} each` : formatGroceryAmount(item)}
            {dates.length > 0 ? ` · ${dates.join(" · ")}` : ""}
          </p>
        </div>
        <PantryStateBadge state={item.state} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {PANTRY_STATES.map((option) => (
          <form key={option.value} action={changePantryState}>
            <input type="hidden" name="id" value={item.id} />
            <input type="hidden" name="state" value={option.value} />
            <Button
              type="submit"
              size="sm"
              variant={item.state === option.value ? "default" : "outline"}
              aria-pressed={item.state === option.value}
            >
              {option.label}
            </Button>
          </form>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onEdit}>
          Edit
        </Button>
        <form action={removePantryItem}>
          <input type="hidden" name="id" value={item.id} />
          <Button type="submit" variant="ghost" size="sm" className="text-muted-foreground">
            <Trash2 /> Remove
          </Button>
        </form>
      </div>
    </div>
  );
}

function EditPantryItem({ item, onDone }: { item: PantryItem; onDone: () => void }) {
  const [state, action, pending] = useActionState<PantryFormState, FormData>(savePantryItem, {});

  useEffect(() => {
    if (state.saved) onDone();
  }, [state.saved, onDone]);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="id" value={item.id} />
      <PantryFields item={item} />
      {state.error && <FormError message={state.error} />}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="animate-spin" />}
          Save changes
        </Button>
        <Button type="button" variant="ghost" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function PantryFields({ item }: { item?: PantryItem }) {
  return (
    <>
      <div>
        <Label htmlFor={fieldId(item, "name")}>Ingredient</Label>
        <Input
          id={fieldId(item, "name")}
          name="name"
          defaultValue={item?.name ?? ""}
          maxLength={60}
          required
          className="mt-1.5"
        />
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)_9rem] gap-3">
        <div>
          <Label htmlFor={fieldId(item, "quantity")}>Amount</Label>
          <Input
            id={fieldId(item, "quantity")}
            name="quantity"
            type="number"
            inputMode="decimal"
            min="0.01"
            max="9999"
            step="any"
            defaultValue={item?.quantity ?? 1}
            required
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor={fieldId(item, "unit")}>Unit</Label>
          <select
            id={fieldId(item, "unit")}
            name="unit"
            defaultValue={item?.unit ?? "each"}
            className={cn(fieldClass, "mt-1.5")}
          >
            {UNITS.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
        </div>
      </div>
      <fieldset>
        <legend className="text-sm font-medium">Status</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {PANTRY_STATES.map((option) => (
            <label key={option.value} className="cursor-pointer">
              <input
                type="radio"
                name="state"
                value={option.value}
                defaultChecked={(item?.state ?? "have") === option.value}
                className="peer sr-only"
              />
              <span className="inline-flex h-9 items-center rounded-full border border-input px-3 text-sm peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground peer-focus-visible:ring-4 peer-focus-visible:ring-ring/20">
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-3 sm:grid-cols-3">
        <DateField item={item} name="boughtOn" label="Bought" value={item?.boughtOn} />
        <DateField item={item} name="openedOn" label="Opened" value={item?.openedOn} />
        <DateField item={item} name="expiresOn" label="Expires" value={item?.expiresOn} />
      </div>
    </>
  );
}

function DateField({
  item,
  name,
  label,
  value,
}: {
  item?: PantryItem;
  name: "boughtOn" | "openedOn" | "expiresOn";
  label: string;
  value?: string | null;
}) {
  const id = fieldId(item, name);
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={name} type="date" defaultValue={value ?? ""} className="mt-1.5" />
    </div>
  );
}

function fieldId(item: PantryItem | undefined, name: string) {
  return `${item?.id ?? "new"}-${name}`;
}

function FormError({ message }: { message: string }) {
  return (
    <p role="alert" className="rounded-2xl bg-tomato-soft px-4 py-3 text-sm text-tomato-ink">
      {message}
    </p>
  );
}
