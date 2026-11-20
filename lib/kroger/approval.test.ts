import { describe, expect, it } from "vitest";
import { approvedCartItems } from "./approval";
import { preferredProduct } from "./preferred";

const onList = new Set(["yellow onion", "chicken thighs"]);
const matches = new Map([
  ["yellow onion", ["111"]],
  ["chicken thighs", ["222", "333"]],
]);

describe("approvedCartItems", () => {
  it("sends only the products the user left approved", () => {
    expect(approvedCartItems([{ name: "yellow onion", upc: "111" }], onList, matches)).toEqual([
      { upc: "111", quantity: 1 },
    ]);
  });

  it("combines one product that covers two ingredients", () => {
    const shared = new Map([
      ["yellow onion", ["111"]],
      ["onion", ["111"]],
    ]);
    expect(
      approvedCartItems(
        [
          { name: "yellow onion", upc: "111" },
          { name: "onion", upc: "111" },
        ],
        new Set(["yellow onion", "onion"]),
        shared,
      ),
    ).toEqual([{ upc: "111", quantity: 2 }]);
  });

  it("refuses a product that wasn't a match for that ingredient", () => {
    expect(approvedCartItems([{ name: "yellow onion", upc: "999" }], onList, matches)).toBeNull();
  });

  it("refuses an ingredient that isn't on the grocery list", () => {
    expect(approvedCartItems([{ name: "saffron", upc: "111" }], onList, matches)).toBeNull();
  });
});

describe("preferredProduct", () => {
  it("skips an out-of-stock result when a later one is in stock", () => {
    expect(
      preferredProduct([
        { upc: "out", inStock: false },
        { upc: "in", inStock: true },
      ])?.upc,
    ).toBe("in");
  });

  it("keeps the first result when nothing is in stock", () => {
    expect(preferredProduct([{ upc: "only", inStock: false }])?.upc).toBe("only");
  });
});
