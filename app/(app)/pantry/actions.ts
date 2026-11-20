"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { addPantryItem, deletePantryItem, setPantryItemState, updatePantryItem } from "@/lib/data";
import { pantryStateSchema, parsePantryForm } from "@/lib/pantry";

export type PantryFormState = {
  error?: string;
  saved?: boolean;
};

const FAILED = "We couldn't save that pantry item. Please try again.";
const DUPLICATE = "That ingredient is already in your pantry. Edit it instead.";

function failure(reason: string | null | undefined): PantryFormState {
  if (reason === "duplicate") return { error: DUPLICATE };
  return { error: FAILED };
}

export async function createPantryItem(
  _prev: PantryFormState,
  formData: FormData,
): Promise<PantryFormState> {
  const parsed = parsePantryForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { ok, reason } = await addPantryItem(parsed.data);
  if (!ok) return failure(reason);

  revalidatePath("/pantry");
  return { saved: true };
}

export async function savePantryItem(
  _prev: PantryFormState,
  formData: FormData,
): Promise<PantryFormState> {
  const id = z.guid().safeParse(formData.get("id"));
  const parsed = parsePantryForm(formData);
  if (!id.success || !parsed.success) {
    return { error: parsed.success ? "Choose a pantry item." : parsed.error.issues[0].message };
  }

  const { ok, reason } = await updatePantryItem(id.data, parsed.data);
  if (!ok) return failure(reason);

  revalidatePath("/pantry");
  return { saved: true };
}

export async function changePantryState(formData: FormData) {
  const id = z.guid().safeParse(formData.get("id"));
  const state = pantryStateSchema.safeParse(formData.get("state"));
  if (!id.success || !state.success) return;

  await setPantryItemState(id.data, state.data);
  revalidatePath("/pantry");
}

export async function removePantryItem(formData: FormData) {
  const id = z.guid().safeParse(formData.get("id"));
  if (!id.success) return;

  await deletePantryItem(id.data);
  revalidatePath("/pantry");
}
