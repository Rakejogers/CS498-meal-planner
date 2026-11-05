# Combined grocery list

User Story 8. `/groceries` shows one list with every ingredient from the dinners in the user's current weekly plan (the same plan the dashboard shows, from `getMealPlan`). Planning new dinners changes the list too. With no plan yet, the page links to the dashboard to plan the week.

Recipes are already written for the household's serving count when they're generated, so the list adds their amounts as they are, with no scaling.

Items are grouped by store aisle (`groupByAisle`), in the order a store is usually walked. The model tags each ingredient with an aisle when it plans; plans saved before that read as "Everything else". Each item shows numbered dots for the dinners that use it, matching the numbers on the dashboard's dinner cards.

Shoppers can tick items off as they go. What's in the basket is kept in the browser's `localStorage`, per plan, so it survives a reload in the store and a new plan starts an empty basket. "Copy list" copies what's left to buy, by aisle.

## Quantity rules

`combineGroceries(meals)` in `lib/groceries.ts` is a pure function with unit tests.

- Match ingredient names on case and spacing only. Don't merge different preparations or guess synonyms: garlic and garlic powder stay separate.
- Add grams, kilograms, ounces, and pounds together by weight; milliliters, liters, US cups, tablespoons, and teaspoons by volume. An amount keeps the unit it was first listed in.
- Never convert volume into weight; that needs a density per ingredient. Different kinds of amount for the same ingredient show side by side ("1 can + 2").
- Counts (`each`) and packages (`can`, `clove`, `bunch`, ...) add up only with the same unit.
- Keep full precision and round only for display.

Amounts are the full recipe totals. Pantry deductions, product matching, prices, and retailer carts are separate user stories.
