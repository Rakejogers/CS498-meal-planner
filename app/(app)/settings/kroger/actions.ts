"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { saveKrogerStore } from "@/lib/data";
import { isKrogerConfigured } from "@/lib/kroger/client";
import { KROGER_SETTINGS_PATH } from "@/lib/kroger/oauth";
import { disconnectKroger as forgetKrogerLogin } from "@/lib/kroger/session";
import { getStore, searchStores, type KrogerStore } from "@/lib/kroger/stores";

const UNREACHABLE = "We couldn't reach Kroger. Please try again in a moment.";
const UNAVAILABLE = "Kroger isn't set up on this site yet.";

export type FindStoresState = {
  error?: string;
  zipCode?: string;
  stores?: KrogerStore[];
};

const zipSchema = z
  .string()
  .trim()
  .regex(/^\d{5}$/, "Enter a 5-digit ZIP code.");

export async function findStores(
  _prev: FindStoresState,
  formData: FormData,
): Promise<FindStoresState> {
  const zipCode = String(formData.get("zipCode") ?? "");
  const parsed = zipSchema.safeParse(zipCode);
  if (!parsed.success) return { error: parsed.error.issues[0].message, zipCode };
  if (!isKrogerConfigured()) return { error: UNAVAILABLE, zipCode };

  try {
    return { zipCode: parsed.data, stores: await searchStores(parsed.data) };
  } catch (error) {
    console.error("findStores failed:", error);
    return { error: UNREACHABLE, zipCode };
  }
}

export type ChooseStoreState = {
  error?: string;
  saved?: boolean;
};

const locationIdSchema = z.string().regex(/^[A-Za-z0-9]{1,20}$/);

export async function chooseStore(
  _prev: ChooseStoreState,
  formData: FormData,
): Promise<ChooseStoreState> {
  const parsed = locationIdSchema.safeParse(formData.get("locationId"));
  if (!parsed.success) return { error: "Pick a store from the list." };
  if (!isKrogerConfigured()) return { error: UNAVAILABLE };

  // Look the store up instead of trusting a name and address from the form.
  let store: KrogerStore | null;
  try {
    store = await getStore(parsed.data);
  } catch (error) {
    console.error("chooseStore failed:", error);
    return { error: UNREACHABLE };
  }
  if (!store) return { error: "Kroger doesn't know that store. Try searching again." };

  const { ok } = await saveKrogerStore(store);
  if (!ok) return { error: "We couldn't save your store. Please try again." };

  revalidatePath(KROGER_SETTINGS_PATH);
  return { saved: true };
}

export async function disconnectKroger() {
  await forgetKrogerLogin();
  // Drops any `?kroger=connected` left in the URL from connecting.
  redirect(KROGER_SETTINGS_PATH);
}
