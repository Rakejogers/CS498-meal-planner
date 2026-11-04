import "server-only";
import { z } from "zod";
import { krogerGet } from "./client";

// Kroger product search at one store (the Products API). Prices and stock are
// per store, so a location ID is required. Grocery matching will build on this.

export type KrogerProduct = {
  productId: string;
  /** What the cart API takes. */
  upc: string;
  name: string;
  brand: string | null;
  /** Package size as Kroger writes it, e.g. "16 oz" or "1 ct". */
  size: string | null;
  /** Regular price in dollars, when the store lists one. */
  price: number | null;
  /** Sale price in dollars, when there is one. */
  promoPrice: number | null;
  imageUrl: string | null;
  inStock: boolean;
};

const productSchema = z.object({
  productId: z.string(),
  upc: z.string(),
  description: z.string(),
  brand: z.string().optional(),
  images: z
    .array(
      z.object({
        perspective: z.string().optional(),
        featured: z.boolean().optional(),
        sizes: z.array(z.object({ size: z.string(), url: z.string() })),
      }),
    )
    .optional(),
  items: z
    .array(
      z.object({
        size: z.string().optional(),
        price: z.object({ regular: z.number(), promo: z.number().optional() }).optional(),
        inventory: z.object({ stockLevel: z.string() }).optional(),
      }),
    )
    .optional(),
});

type Product = z.infer<typeof productSchema>;

function toProduct(product: Product): KrogerProduct {
  const item = product.items?.[0];
  const image = product.images?.find((image) => image.featured) ?? product.images?.[0];
  const promo = item?.price?.promo;
  return {
    productId: product.productId,
    upc: product.upc,
    name: product.description,
    brand: product.brand || null,
    size: item?.size || null,
    price: item?.price?.regular || null,
    // Kroger sends 0 when there's no sale.
    promoPrice: promo && promo > 0 ? promo : null,
    imageUrl: image?.sizes.find((size) => size.size === "medium")?.url ?? null,
    inStock: item?.inventory?.stockLevel !== "TEMPORARILY_OUT_OF_STOCK",
  };
}

/**
 * Products matching a search term at a store, best match first. Kroger needs
 * the term to be 3 to 127 characters.
 */
export async function searchProducts(
  term: string,
  locationId: string,
  limit = 5,
): Promise<KrogerProduct[]> {
  const trimmed = term.trim().slice(0, 127);
  if (trimmed.length < 3) return [];

  const body = await krogerGet("/products", {
    "filter.term": trimmed,
    "filter.locationId": locationId,
    "filter.limit": String(limit),
  });
  const data = z.object({ data: z.array(z.unknown()) }).parse(body).data;

  return data.flatMap((item) => {
    const parsed = productSchema.safeParse(item);
    return parsed.success ? [toProduct(parsed.data)] : [];
  });
}
