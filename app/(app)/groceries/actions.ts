"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { deleteGroceryMealEntry, saveGroceryMealEntry, setGroceryMealIncluded } from "@/lib/data";
import { parseGroceryMealForm } from "@/lib/groceries";

export type GroceryFormState = { error?: string; saved?: boolean };

export async function saveMeal(
  _previous: GroceryFormState,
  form: FormData,
): Promise<GroceryFormState> {
  const parsed = parseGroceryMealForm(form);
  if (!parsed.success)
    return {
      error:
        "Check the meal name, servings, and every ingredient. Use positive quantities like 0.5 or 1/2, or leave the amount blank for ‘as needed’.",
    };
  const id = z
    .uuid()
    .optional()
    .safeParse(form.get("id") ?? undefined);
  if (!id.success) return { error: "This meal couldn't be found. Refresh and try again." };
  const { ok } = await saveGroceryMealEntry(parsed.data, id.data);
  if (!ok)
    return { error: "We couldn't save this meal. Your entries are still here; please try again." };
  revalidatePath("/groceries");
  return { saved: true };
}

export async function changeMealInclusion(
  _previous: GroceryFormState,
  form: FormData,
): Promise<GroceryFormState> {
  const parsed = z.object({ id: z.uuid(), included: z.enum(["true", "false"]) }).safeParse({
    id: form.get("id"),
    included: form.get("included"),
  });
  if (!parsed.success) return { error: "Refresh this page and try again." };
  const { ok } = await setGroceryMealIncluded(parsed.data.id, parsed.data.included === "true");
  if (!ok) return { error: "We couldn't update this meal. Please try again." };
  revalidatePath("/groceries");
  return { saved: true };
}

export async function removeMeal(
  _previous: GroceryFormState,
  form: FormData,
): Promise<GroceryFormState> {
  const parsed = z.uuid().safeParse(form.get("id"));
  if (!parsed.success) return { error: "Refresh this page and try again." };
  const { ok } = await deleteGroceryMealEntry(parsed.data);
  if (!ok) return { error: "We couldn't remove this meal. Please try again." };
  revalidatePath("/groceries");
  return { saved: true };
}
