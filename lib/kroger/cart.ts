import "server-only";
import { KROGER_API, KrogerError } from "./client";

// Adds products to the user's Kroger cart. Kroger's public API can only add:
// it can't read the cart or check out. After adding, send the user to
// KROGER_CART_URL to review and check out on kroger.com.

export const KROGER_CART_URL = "https://www.kroger.com/cart";

export type CartItem = {
  upc: string;
  quantity: number;
  /** How the order is fulfilled. Pickup unless the user chooses otherwise. */
  modality?: "PICKUP" | "DELIVERY";
};

/** Needs a user token from `getKrogerAccessToken` (session.ts). */
export async function addToCart(accessToken: string, items: CartItem[]) {
  if (items.length === 0) return;
  const response = await fetch(`${KROGER_API}/cart/add`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      items: items.map(({ upc, quantity, modality = "PICKUP" }) => ({ upc, quantity, modality })),
    }),
    cache: "no-store",
  });
  if (!response.ok) throw new KrogerError("Adding to the Kroger cart failed", response.status);
}
