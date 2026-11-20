"use server";

import { z } from "zod";
import { getMealPlan, getProfile } from "@/lib/data";
import { combineGroceries } from "@/lib/groceries";
import { addToCart } from "@/lib/kroger/cart";
import { approvedCartItems, type ReviewedProduct } from "@/lib/kroger/approval";
import { searchProducts } from "@/lib/kroger/products";
import { getKrogerAccessToken } from "@/lib/kroger/session";
import { localDate } from "@/lib/meal-plan";

export type CartFormState = {
  error?: string;
  added?: number;
};

const submissionSchema = z.object({
  planId: z.guid(),
  items: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(80),
        upc: z.string().trim().min(1).max(32),
      }),
    )
    .max(80),
});

const FAILED = "Kroger couldn't add these to your cart. Please try again.";
const STALE = "A product changed. Refresh the list and review it again.";

/**
 * Adds the products the user approved to their Kroger cart. Each product is
 * checked against the current grocery list and a fresh store search, so a
 * rejected ingredient or an edited request is not submitted.
 */
export async function addApprovedGroceries(
  _prev: CartFormState,
  formData: FormData,
): Promise<CartFormState> {
  let items: unknown = [];
  try {
    items = JSON.parse(String(formData.get("items") ?? "[]"));
  } catch {
    return { error: "Choose the products to add." };
  }
  const parsed = submissionSchema.safeParse({ planId: formData.get("planId"), items });
  if (!parsed.success || parsed.data.items.length === 0) {
    return { error: "Approve at least one product." };
  }

  const [plan, { krogerStore }] = await Promise.all([
    getMealPlan(localDate(new Date())),
    getProfile(),
  ]);
  if (!plan || plan.id !== parsed.data.planId) {
    return { error: "That grocery list is out of date. Refresh and try again." };
  }
  if (!krogerStore) return { error: "Choose your Kroger store first." };

  const token = await getKrogerAccessToken();
  if (!token) return { error: "Connect Kroger to add these to your cart." };

  const onList = new Set(combineGroceries(plan.meals).map((item) => item.name));
  const matches = new Map<string, string[]>();
  for (const item of parsed.data.items) {
    if (!onList.has(item.name)) return { error: STALE };
    try {
      const products = await searchProducts(item.name, krogerStore.locationId, 5);
      matches.set(
        item.name,
        products.map((product) => product.upc),
      );
    } catch (error) {
      console.error(
        "addApprovedGroceries search failed:",
        error instanceof Error ? error.message : error,
      );
      return { error: FAILED };
    }
  }

  const cartItems = approvedCartItems(
    parsed.data.items satisfies ReviewedProduct[],
    onList,
    matches,
  );
  if (!cartItems) return { error: STALE };

  try {
    await addToCart(token, cartItems);
  } catch (error) {
    console.error("addApprovedGroceries failed:", error instanceof Error ? error.message : error);
    return { error: FAILED };
  }
  return { added: cartItems.length };
}
