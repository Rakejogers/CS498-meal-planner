/** A store product the user can approve for their Kroger cart. */
export type MatchedProduct = {
  upc: string;
  name: string;
  brand: string | null;
  size: string | null;
  price: number | null;
  promoPrice: number | null;
};

export type GroceryProductMatch = {
  name: string;
  product: MatchedProduct | null;
};
