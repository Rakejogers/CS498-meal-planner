import { describe, expect, it } from "vitest";
import {
  availablePantryNames,
  isPantryAvailable,
  pantryForPlanning,
  pantryNameSet,
  parsePantryForm,
  remainingPantry,
} from "./pantry";

describe("availablePantryNames", () => {
  it("keeps only foods marked have, normalized and without duplicates", () => {
    expect(
      availablePantryNames([
        { name: " Olive   Oil ", state: "have" },
        { name: "olive oil", state: "have" },
        { name: "Spinach", state: "low" },
        { name: "Eggs", state: "out" },
        { name: "Lemons", state: "have" },
      ]),
    ).toEqual(["olive oil", "lemons"]);
  });
});

describe("remainingPantry", () => {
  const spinach = {
    name: "spinach",
    quantity: 2,
    unit: "cup" as const,
    expiresOn: "2026-11-22",
    state: "have" as const,
  };

  it("subtracts what earlier dinners use before the next dinner is planned", () => {
    const left = remainingPantry(
      [spinach, { name: "rice", quantity: 1, unit: "lb", expiresOn: null, state: "have" }],
      [
        { ingredients: [{ name: "Spinach", quantity: 1, unit: "cup" }] },
        { ingredients: [{ name: "spinach", quantity: 2, unit: "cup" }] },
      ],
    );

    expect(left.find((item) => item.name === "spinach")?.quantity).toBe(0);
    expect(left.find((item) => item.name === "rice")?.quantity).toBe(1);
  });

  it("converts weight and leaves a different kind of amount untouched", () => {
    const left = remainingPantry(
      [{ name: "chicken", quantity: 1, unit: "lb", expiresOn: null, state: "have" }],
      [{ ingredients: [{ name: "chicken", quantity: 1, unit: "cup" }] }],
    );

    expect(left[0]?.quantity).toBe(1);
  });
});

describe("pantryForPlanning", () => {
  it("puts the soonest expiration first and skips empty items", () => {
    expect(
      pantryForPlanning([
        { name: "rice", quantity: 1, unit: "lb", expiresOn: null, state: "have" },
        { name: "spinach", quantity: 1, unit: "cup", expiresOn: "2026-11-21", state: "low" },
        { name: "milk", quantity: 1, unit: "l", expiresOn: "2026-11-18", state: "have" },
        { name: "eggs", quantity: 0, unit: "each", expiresOn: "2026-11-17", state: "out" },
      ]).map((item) => item.name),
    ).toEqual(["milk", "spinach", "rice"]);
  });
});

describe("parsePantryForm", () => {
  it("rejects an opened date that comes before the item was bought", () => {
    const form = new FormData();
    form.set("name", "Milk");
    form.set("quantity", "1");
    form.set("unit", "l");
    form.set("state", "have");
    form.set("boughtOn", "2026-11-04");
    form.set("openedOn", "2026-11-01");

    const parsed = parsePantryForm(form);
    expect(parsed.success).toBe(false);
    if (!parsed.success) expect(parsed.error.issues[0]?.message).toMatch(/bought/i);
  });
});

describe("isPantryAvailable", () => {
  it("matches ingredient names by exact normalized name", () => {
    const pantry = pantryNameSet([" Yellow   Onion ", "rice"]);

    expect(isPantryAvailable("yellow onion", pantry)).toBe(true);
    expect(isPantryAvailable("yellow  onion", pantry)).toBe(true);
    expect(isPantryAvailable("onion", pantry)).toBe(false);
  });
});
