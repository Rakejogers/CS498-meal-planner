// Which reviewed products are allowed into the Kroger cart. The page sends
// only what the user left approved; this checks those against the grocery
// list and the products Kroger actually returned.

export const KROGER_CART_URL = "https://www.kroger.com/cart";

type ApprovedCartItem = { upc: string; quantity: number };

export type ReviewedProduct = { name: string; upc: string };

/**
 * Cart lines for the products the user approved. Null when a submitted
 * product isn't on the grocery list or isn't one of that ingredient's
 * matches, so a stale or edited request can't add something they didn't review.
 * The same product chosen for two ingredients is added once, with the quantities combined.
 */
export function approvedCartItems(
  submitted: readonly ReviewedProduct[],
  onList: ReadonlySet<string>,
  matches: ReadonlyMap<string, readonly string[]>,
): ApprovedCartItem[] | null {
  const byUpc = new Map<string, number>();
  for (const item of submitted) {
    if (!onList.has(item.name)) return null;
    const upcs = matches.get(item.name);
    if (!upcs?.includes(item.upc)) return null;
    byUpc.set(item.upc, (byUpc.get(item.upc) ?? 0) + 1);
  }
  return [...byUpc].map(([upc, quantity]) => ({ upc, quantity }));
}
