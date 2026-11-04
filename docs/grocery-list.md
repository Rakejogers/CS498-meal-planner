# Combined grocery list

User Story 8 has a working manual entry flow at `/groceries`, linked from the dashboard and signed-in navigation. Automatic weekly meal generation and recipe storage are not implemented yet, so this feature does not invent a meal-plan schema or present sample meals as user data.

## Current flow

1. Add a meal, its original serving count, and the original ingredient amounts.
2. Choose how many people to cook for. Both serving fields initially use the saved household size.
3. The saved meal is included in the combined list. Edit it, leave it out, or remove it at any time.
4. Review the ingredient totals and copy the list for shopping.

Entries persist in `public.grocery_meals`. Every read and write checks the signed-in user in `lib/data.ts`, and RLS separately restricts access to the owner. The worksheet represents the current shopping plan; it does not track past weeks. Changing the household default affects new entries; existing meals retain their chosen servings.

## Meal-generation integration

`combineGroceries(meals)` in `lib/groceries.ts` is a pure function with no React or database dependency. A generated recipe can be mapped to the same input:

```ts
type GroceryMeal = {
  id: string;
  title: string;
  recipeServings: number; // servings the ingredient amounts were written for
  plannedServings: number;
  included: boolean; // approved for this shopping plan
  ingredients: {
    name: string;
    quantity: number | null; // null means an unspecified amount
    unit: string;
  }[];
};
```

Validate generated or imported recipes with `groceryMealSchema` before using the calculator. When the weekly-plan data source is available, adapt its approved recipes in the data layer and reuse `combineGroceries` and the grocery list presentation. The manual worksheet is a separate source, so integrating it should explicitly prevent double-counting the same planned meal.

## Quantity rules

- Scale each ingredient by `plannedServings / recipeServings`, then add duplicates.
- Match ingredient names by case and whitespace only. Do not merge different preparations, substitute foods, or guess ingredient synonyms.
- Convert grams, kilograms, ounces, and pounds by weight; milliliters, liters, US cups, tablespoons, teaspoons, and fluid ounces by volume.
- Never convert weight into volume without an ingredient-specific density. Show incompatible quantities alongside each other on the same ingredient row.
- Merge recognized count/package aliases, such as `can` and `cans`. Unknown units merge only when their normalized labels match; can or package sizes are not inferred.
- Preserve unspecified amounts alongside measured amounts. Decimal, fraction, and mixed-fraction inputs are supported; blank means “as needed.”
- Keep full calculation precision and round only the displayed amount.

Pantry availability, product matching, prices, and retailer carts remain separate user stories. The current list contains full recipe requirements and reminds people to check their kitchen.

Validation covers quantity parsing and math in Vitest, ownership and write permissions in pgTAP, and saving/reloading, scaling, exclusion, editing, and removal against real local Supabase in Playwright.
