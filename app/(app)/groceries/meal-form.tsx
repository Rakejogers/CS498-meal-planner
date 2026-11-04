"use client";

import { Plus, Trash2 } from "lucide-react";
import { useActionState, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { GroceryMeal } from "@/lib/groceries";
import { saveMeal, type GroceryFormState } from "./actions";

type IngredientRow = { key: number; name: string; quantity: string; unit: string };
const emptyRow = (key: number): IngredientRow => ({ key, name: "", quantity: "", unit: "" });

export function AddMealCard({
  householdSize,
  initiallyOpen,
}: {
  householdSize: number;
  initiallyOpen: boolean;
}) {
  const details = useRef<HTMLDetailsElement>(null);
  const [addedMeals, setAddedMeals] = useState(0);
  return (
    <Card className="p-5">
      <details ref={details} open={initiallyOpen}>
        <summary className="cursor-pointer rounded font-display text-xl font-medium outline-none focus-visible:ring-4 focus-visible:ring-ring/20">
          Add a meal
        </summary>
        <div className="mt-5">
          <MealForm
            householdSize={householdSize}
            onSaved={() => {
              if (details.current) {
                details.current.open = false;
                details.current.querySelector("summary")?.focus();
              }
              setAddedMeals((count) => count + 1);
            }}
          />
        </div>
      </details>
      <p role="status" className="sr-only">
        {addedMeals > 0 &&
          `${addedMeals} ${addedMeals === 1 ? "meal" : "meals"} added to your grocery list.`}
      </p>
    </Card>
  );
}

export function MealForm({
  householdSize,
  meal,
  onSaved,
}: {
  householdSize: number;
  meal?: GroceryMeal;
  onSaved?: () => void;
}) {
  const prefix = useId();
  const [edited, setEdited] = useState(false);
  const nextKey = useRef(meal?.ingredients.length ?? 1);
  const [title, setTitle] = useState(meal?.title ?? "");
  const [recipeServings, setRecipeServings] = useState(
    String(meal?.recipeServings ?? householdSize),
  );
  const [plannedServings, setPlannedServings] = useState(
    String(meal?.plannedServings ?? householdSize),
  );
  const [rows, setRows] = useState<IngredientRow[]>(
    meal
      ? meal.ingredients.map((ingredient, key) => ({
          ...ingredient,
          key,
          quantity: ingredient.quantity === null ? "" : String(ingredient.quantity),
        }))
      : [emptyRow(0)],
  );
  const [state, action, pending] = useActionState<GroceryFormState, FormData>(
    async (previous, form) => {
      const result = await saveMeal(previous, form);
      if (result.saved) setEdited(false);
      if (result.saved && !meal) {
        setTitle("");
        setRecipeServings(String(householdSize));
        setPlannedServings(String(householdSize));
        setRows([emptyRow(nextKey.current++)]);
        onSaved?.();
      }
      return result;
    },
    {},
  );

  function updateRow(key: number, field: "name" | "quantity" | "unit", value: string) {
    setRows((current) =>
      current.map((row) => (row.key === key ? { ...row, [field]: value } : row)),
    );
  }

  return (
    <form
      action={action}
      onChange={() => setEdited(true)}
      aria-label={meal ? `Edit ${meal.title}` : "Add a meal"}
      className="space-y-5"
    >
      {meal && <input type="hidden" name="id" value={meal.id} />}
      <input type="hidden" name="included" value={String(meal?.included ?? true)} />
      <fieldset disabled={pending} className="min-w-0 space-y-5">
        <div className="space-y-2">
          <Label htmlFor={`${prefix}-title`}>Meal name</Label>
          <Input
            id={`${prefix}-title`}
            name="title"
            placeholder="e.g. Lemon chicken pasta"
            required
            maxLength={100}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor={`${prefix}-recipe`}>Recipe serves</Label>
            <Input
              id={`${prefix}-recipe`}
              name="recipeServings"
              type="number"
              min={1}
              max={100}
              required
              value={recipeServings}
              onChange={(event) => setRecipeServings(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${prefix}-planned`}>Cooking for</Label>
            <Input
              id={`${prefix}-planned`}
              name="plannedServings"
              type="number"
              min={1}
              max={12}
              required
              value={plannedServings}
              onChange={(event) => setPlannedServings(event.target.value)}
            />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Enter the original recipe amounts. We&apos;ll scale them to the number you&apos;re cooking
          for.
        </p>
        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-medium">Ingredients</h3>
            <p id={`${prefix}-hint`} className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Use the same name for shared ingredients. Amounts accept decimals or fractions; leave
              blank for &ldquo;as needed&rdquo;.
            </p>
          </div>
          {rows.map((row, index) => (
            <fieldset
              key={row.key}
              aria-describedby={`${prefix}-hint`}
              className="grid grid-cols-[1fr_1fr_auto] gap-2 rounded-2xl bg-muted/60 p-3"
            >
              <legend className="sr-only">Ingredient {index + 1}</legend>
              <div className="col-span-3 space-y-1.5">
                <Label htmlFor={`${prefix}-${row.key}-name`}>Ingredient {index + 1}</Label>
                <Input
                  id={`${prefix}-${row.key}-name`}
                  name="ingredientName"
                  placeholder="e.g. chicken breast"
                  required
                  maxLength={100}
                  value={row.name}
                  onChange={(event) => updateRow(row.key, "name", event.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`${prefix}-${row.key}-quantity`}>Amount</Label>
                <Input
                  id={`${prefix}-${row.key}-quantity`}
                  name="quantity"
                  placeholder="e.g. 1/2"
                  maxLength={30}
                  value={row.quantity}
                  onChange={(event) => updateRow(row.key, "quantity", event.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`${prefix}-${row.key}-unit`}>Unit</Label>
                <Input
                  id={`${prefix}-${row.key}-unit`}
                  name="unit"
                  placeholder="g, cup, each…"
                  list={`${prefix}-units`}
                  maxLength={30}
                  value={row.unit}
                  onChange={(event) => updateRow(row.key, "unit", event.target.value)}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="self-end"
                aria-label={`Remove ingredient ${index + 1}`}
                disabled={rows.length === 1}
                onClick={() =>
                  setRows((current) => current.filter((candidate) => candidate.key !== row.key))
                }
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </Button>
            </fieldset>
          ))}
          <datalist id={`${prefix}-units`}>
            {[
              "g",
              "kg",
              "oz",
              "lb",
              "ml",
              "l",
              "tsp",
              "tbsp",
              "cup",
              "each",
              "can",
              "clove",
              "bunch",
            ].map((unit) => (
              <option key={unit} value={unit} />
            ))}
          </datalist>
          <Button
            type="button"
            variant="outline"
            disabled={rows.length >= 50}
            onClick={() => setRows((current) => [...current, emptyRow(nextKey.current++)])}
          >
            <Plus aria-hidden="true" /> Add ingredient
          </Button>
        </div>
        <Button type="submit" className="w-full">
          {pending ? "Saving…" : meal ? "Save meal" : "Add to grocery list"}
        </Button>
      </fieldset>
      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      <p role="status" className="text-sm text-sage-ink">
        {state.saved &&
          !edited &&
          (meal ? "Meal saved. Your list is up to date." : "Meal added. Your list is up to date.")}
      </p>
    </form>
  );
}
