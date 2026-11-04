import "server-only";
import { z } from "zod";
import { krogerGet } from "./client";

// Kroger stores (the Locations API). Any store in the Kroger family counts:
// Kroger, Ralphs, Fred Meyer, Harris Teeter, and so on.

export type KrogerStore = {
  locationId: string;
  name: string;
  address: string;
};

const locationSchema = z.object({
  locationId: z.string().regex(/^[A-Za-z0-9]{1,20}$/),
  name: z.string().min(1),
  address: z.object({
    addressLine1: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
  }),
  // Warehouses and fulfillment hubs show up in results too, without departments.
  departments: z.array(z.unknown()).optional(),
});

type Location = z.infer<typeof locationSchema>;

function toStore(location: Location): KrogerStore {
  const { addressLine1, city, state, zipCode } = location.address;
  // Kroger names are "<chain> - <store>", and sometimes the two match ("Ruler - Ruler").
  const name = [...new Set(location.name.split(" - ").map((part) => part.trim()))]
    .filter(Boolean)
    .join(" – ");
  return {
    locationId: location.locationId,
    name: name.slice(0, 120),
    address: `${addressLine1}, ${city}, ${state} ${zipCode}`.slice(0, 200),
  };
}

const MAX_STORES = 8;

/** Grocery stores near a ZIP code, closest first. */
export async function searchStores(zipCode: string): Promise<KrogerStore[]> {
  const body = await krogerGet("/locations", {
    "filter.zipCode.near": zipCode,
    "filter.radiusInMiles": "15",
    // Ask for extra: some results are warehouses and get filtered out.
    "filter.limit": "25",
  });
  const data = z.object({ data: z.array(z.unknown()) }).parse(body).data;

  return data
    .flatMap((item) => {
      const parsed = locationSchema.safeParse(item);
      const isStore = parsed.success && (parsed.data.departments?.length ?? 0) > 0;
      return isStore ? [toStore(parsed.data)] : [];
    })
    .slice(0, MAX_STORES);
}

/** One store by its Kroger location ID, or null if Kroger doesn't know it. */
export async function getStore(locationId: string): Promise<KrogerStore | null> {
  const body = await krogerGet(`/locations/${encodeURIComponent(locationId)}`);
  if (body === null) return null;
  const parsed = z.object({ data: locationSchema }).safeParse(body);
  return parsed.success ? toStore(parsed.data.data) : null;
}
