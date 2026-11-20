import "server-only";
import type { GroceryProductMatch, MatchedProduct } from "./grocery-match";
import { preferredProduct } from "./preferred";
import { searchProducts, type KrogerProduct } from "./products";

// One store product per grocery ingredient, for the user to approve before
// anything is added to the cart. No match means the ingredient needs attention
// and is left out of the cart.

export type { GroceryProductMatch, MatchedProduct };

const CONCURRENCY = 4;

function toMatch(product: KrogerProduct): MatchedProduct {
  return {
    upc: product.upc,
    name: product.name,
    brand: product.brand,
    size: product.size,
    price: product.price,
    promoPrice: product.promoPrice,
  };
}

/**
 * Looks up each ingredient at `locationId`. A failed lookup leaves that
 * ingredient unmatched instead of failing the whole list.
 */
export async function matchGroceries(
  names: readonly string[],
  locationId: string,
): Promise<GroceryProductMatch[]> {
  const results: GroceryProductMatch[] = new Array(names.length);
  let next = 0;

  async function worker() {
    while (next < names.length) {
      const index = next;
      next += 1;
      const name = names[index];
      try {
        const products = await searchProducts(name, locationId, 5);
        const product = preferredProduct(products);
        results[index] = { name, product: product ? toMatch(product) : null };
      } catch (error) {
        console.error(
          `matchGroceries failed for "${name}":`,
          error instanceof Error ? error.message : error,
        );
        results[index] = { name, product: null };
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, names.length) }, () => worker()));
  return results;
}
