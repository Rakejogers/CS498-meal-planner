/** The in-stock product ranked first, or the first result when every one is out. */
export function preferredProduct<T extends { inStock: boolean }>(products: readonly T[]) {
  return products.find((product) => product.inStock) ?? products[0] ?? null;
}
