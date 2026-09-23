# Senior Design Product Brief
## AI-Assisted Meal Planning and Grocery Preparation Platform

> **Working concept:** A web application that plans a user's meals for the week, accounts for food they already have, builds a consolidated grocery list, matches needed ingredients to real grocery products, and helps move those products into a retailer cart.

---

## 1. Project Overview

This project is a **web-based meal planning and grocery assistant** designed to reduce the time and decision-making involved in planning meals and shopping for groceries.

Instead of functioning as another recipe website, the system connects several tasks that are normally handled separately:

1. Learn the user's household, food preferences, restrictions, cooking habits, and budget preferences.
2. Keep a lightweight record of ingredients and staples the user already has.
3. Generate a coordinated meal plan for the upcoming week.
4. Reuse pantry ingredients and intentionally share ingredients across meals when useful.
5. Combine all required ingredients into one grocery list.
6. Match grocery requirements to real products at the user's selected store.
7. Let the user review or replace product matches.
8. Add approved products to the user's retailer cart.
9. Learn from meal feedback and pantry updates over time.

The central goal is to handle the planning between:

> **"What should I cook this week?" → "My groceries are ready to order."**

For the initial senior-design implementation, the project will be developed as a **responsive web application** so all team members can work in the same development environment.

---

## 2. Problem

Planning meals for a week often requires several disconnected tasks:

- Deciding what to cook.
- Finding recipes.
- Remembering what food is already at home.
- Avoiding repetitive meals.
- Reusing partially used ingredients.
- Combining ingredients across recipes.
- Estimating quantities.
- Searching a grocery store for matching products.
- Building an online grocery cart.

Existing tools often solve only one part of this process. Recipe sites help users find meals, while grocery apps help users buy products, but the user still has to coordinate the entire workflow manually.

This project aims to connect those steps into one system.

---

## 3. Product Vision

The long-term vision is a **personal food-planning system** that becomes more useful as it learns the household.

The system should gradually understand:

- Foods the user likes and dislikes.
- Dietary restrictions and allergies.
- Household size.
- Cooking ability.
- Typical cooking time.
- Preferred meal types.
- Grocery budget preferences.
- Ingredients commonly kept at home.
- Ingredients currently available.
- Ingredients that should be used soon.
- Meals the user previously liked or disliked.
- Preferred grocery store.
- Preferred brands or package sizes.
- Nutrition goals, if the user chooses to provide them.

The goal is not to automate eating or force users into rigid plans. It is to remove repetitive planning work while leaving final decisions with the user.

---

## 4. Target User

The first version should focus on a relatively simple household:

- One person, a couple, or a small household.
- Plans approximately **3–5 dinners per week**.
- Wants to cook at home more often.
- Does not want to search for recipes every week.
- Frequently forgets what ingredients are already available.
- Wants variety without manually planning every meal.
- Uses, or is willing to use, online grocery shopping.

The initial implementation should avoid trying to support every household type, diet program, meal type, and grocery retailer at once.

---

## 5. Core Product Principles

### Minimize User Work

The system should reduce planning effort rather than create another household task.

Users should not need to:

- Catalog every ingredient with exact quantities.
- Maintain gram-level pantry inventory.
- Manually compare every grocery product.
- Build a meal schedule from scratch.
- Re-enter ingredients from every recipe.
- Constantly correct AI-generated information.

### Treat Pantry Information as Approximate

The pantry is useful even if it is not perfectly accurate.

A pantry item can use simple states such as:

- **Have**
- **Running Low**
- **Out**
- **Unsure**

The system should clearly identify uncertain items instead of assuming they are available.

### Plan the Week as a Whole

Meals should be selected as a coordinated weekly plan rather than generated independently.

The planner should consider:

- User preferences.
- Existing pantry items.
- Ingredient reuse.
- Variety.
- Cost.
- Cooking time.
- Leftovers.
- Package sizes and food waste.

For example, if one recipe requires cilantro, the planner may prefer another meal that can use the remaining cilantro later in the week.

### Use AI for Judgment, Normal Code for Facts

AI is useful for:

- Meal selection.
- Recipe generation or adaptation.
- Preference interpretation.
- Natural-language pantry input.
- Explaining why a meal was selected.
- Parsing imported recipes.

Deterministic application logic should handle:

- Quantities.
- Unit conversions.
- Grocery consolidation.
- Package calculations.
- Prices.
- Pantry updates.
- Authentication.
- Retailer API requests.
- Cart submission.
- Persistent user state.

### Require Review Before External Actions

The user should approve important steps before products are added to an external grocery cart.

A typical approval sequence is:

1. Review the weekly meal plan.
2. Review the combined grocery requirements.
3. Review matched store products.
4. Send approved products to the retailer.

---

## 6. Core User Workflow

### Initial Setup

The user creates an account and provides:

- Household size.
- Number of dinners to plan each week.
- Food preferences.
- Foods to avoid.
- Dietary restrictions.
- Typical cooking time.
- Cooking confidence.
- Leftover preferences.
- Budget preference.
- Common kitchen staples.
- Optional ingredients they already want to use.
- Grocery store connection or store selection.

Retailer authorization may also be deferred until the user is ready to build a grocery cart.

### Weekly Planning

A returning user's ideal workflow is:

1. Generate or open the suggested weekly meal plan.
2. Keep, swap, lock, add, or remove meals.
3. Mark nights as leftovers or eating out when needed.
4. Approve the weekly plan.
5. Review uncertain pantry items.
6. Generate the consolidated grocery list.
7. Match required ingredients to store products.
8. Review or replace product matches.
9. Add approved products to the retailer cart.
10. Complete checkout through the retailer.

The weekly planning process should take only a few minutes once the user's preferences and pantry are established.

### After Shopping

Because adding an item to a retailer cart does not prove it was purchased, the system should allow the user to confirm which groceries actually made it home.

Confirmed items can then be added to the user's kitchen inventory.

### After Cooking

After a planned meal is completed, the user can:

- Mark the meal as cooked.
- Record whether leftovers remain.
- Rate the meal.
- Confirm suggested pantry updates.

This feedback helps improve future plans.

---

## 7. Core Functional Areas

### Accounts and Preferences

The system should support:

- Account creation and sign-in.
- Household size.
- Food likes and dislikes.
- Dietary restrictions.
- Cooking preferences.
- Meal frequency.
- Budget preferences.
- Grocery-store settings.

### Weekly Meal Planning

The planner should support:

- Automatic generation of several dinners.
- Planning approximately 3–5 meals per week.
- Personalized meal selection.
- Pantry-aware planning.
- Ingredient reuse across meals.
- Serving-count changes.
- Swapping one meal without regenerating the entire week.
- Locking meals the user wants to keep.
- Adding or removing meals.
- Marking a night as leftovers or eating out.

### Recipes

Each recipe should contain structured data for:

- Recipe title.
- Ingredients.
- Ingredient quantities and units.
- Serving count.
- Cooking time.
- Instructions.
- Optional estimated cost.
- Pantry ingredients used.

Users should also be able to give simple feedback such as:

- Would make again.
- Maybe.
- Do not recommend again.

### Kitchen / Pantry

The pantry should support:

- Common staples.
- User-added ingredients.
- Have / low / out / unsure states.
- Optional quantities.
- Natural-language entry.
- Pre-shopping confirmation of uncertain items.
- Suggested updates after shopping.
- Suggested updates after cooking.
- Identification of ingredients that should be used soon.

### Grocery Planning

Once meals are approved, the application should:

1. Load ingredients from every planned recipe.
2. Normalize ingredient names and units.
3. Combine duplicate ingredients.
4. Calculate total required quantities.
5. Compare requirements against pantry information.
6. Separate items into:
   - Need to buy.
   - Already have.
   - Check at home.
7. Create the final grocery requirements.

### Grocery Retailer Integration

The initial implementation can focus on **Kroger**.

The integration should aim to support:

- Retailer account authorization.
- Store selection.
- Product search.
- Ingredient-to-product matching.
- Package-size and quantity selection.
- Product replacement.
- Product removal.
- Cart submission.
- Handoff to the retailer for checkout.

The application's internal planning and grocery data should remain retailer-independent so additional integrations can be added later.

---

## 8. Core User Stories

### Account and Preferences

1. As a new user, I want to specify how many people I cook for so recipe and grocery quantities are appropriate.
2. As a user, I want to specify foods I dislike so they are not recommended.
3. As a user with dietary restrictions, I want those restrictions applied to meal planning.
4. As a user, I want to specify how much time I normally have to cook.
5. As a user, I want to specify how many dinners I want planned each week.
6. As a user, I want to provide general budget preferences.

### Weekly Planning

7. As a user, I want the system to automatically generate several dinners for my week.
8. As a user, I want meal suggestions to use ingredients I already have when reasonable.
9. As a user, I want meals to share ingredients when useful so I can reduce cost and waste.
10. As a user, I want to swap one meal without regenerating the rest of my week.
11. As a user, I want to lock meals I want to keep.
12. As a user, I want to mark a night as leftovers or eating out.
13. As a user, I want to change serving quantities when needed.

### Recipes

14. As a user, I want clear ingredient lists and cooking instructions.
15. As a user, I want to know which recipe ingredients I already have and which I need to buy.
16. As a user, I want to rate meals so future recommendations can improve.

### Kitchen

17. As a user, I want to quickly tell the system what food I have using natural language.
18. As a user, I want to mark ingredients as have, low, out, or unsure.
19. As a user, I want to know which ingredients I should use soon.
20. As a user, I want pantry updates suggested after shopping or cooking instead of manually recalculating everything.

### Groceries

21. As a user, I want ingredients from all planned meals combined into one grocery list.
22. As a user, I do not want ingredients I already own automatically added to the shopping list.
23. As a user, I want uncertain pantry items identified so I can check them.
24. As a grocery shopper, I want required ingredients matched to products at my selected store.
25. As a user, I want to review and replace product matches before anything is sent to the retailer.
26. As a user, I want to add approved products to my retailer cart in one workflow.
27. As a user, I want to finish checkout through the retailer normally.

---

## 9. Senior Design MVP

The MVP should prove the complete planning-to-grocery workflow rather than maximizing the number of features.

### Required

#### User System
- Sign up and sign in.
- User profile.
- Household size.
- Food preferences.
- Restrictions.
- Cooking preferences.
- Meal frequency.

#### Meal Planning
- Generate a weekly dinner plan.
- Generate approximately 3–5 meals.
- Swap an individual meal.
- Lock a meal.
- Change serving count.
- Regenerate suggestions when needed.

#### Recipes
- Structured ingredients.
- Structured instructions.
- Cooking time.
- Serving count.
- Pantry usage.
- Basic meal feedback.

#### Kitchen
- Pantry and staple records.
- Have / low / out / unsure states.
- Natural-language item entry.
- Kitchen check before grocery planning.

#### Grocery Planning
- Consolidate ingredients across recipes.
- Normalize units.
- Calculate required quantities.
- Remove or flag pantry ingredients.
- Review the generated grocery list.

#### Retailer Integration
- Kroger authorization.
- Store selection.
- Product search.
- Product matching.
- Product replacement.
- Cart submission.
- Checkout handoff.

### Optional Within MVP if Time Allows

- Estimated meal or weekly grocery cost.
- Ingredient expiration/use-soon estimates.
- Favorites.
- Previous-week awareness.
- Better preference learning.
- Automatic post-shopping pantry confirmation.
- Automatic post-cooking pantry suggestions.

---

## 10. Additional / Stretch Features

These features are intentionally outside the core MVP but provide clear directions for extending the project.

### Recipe Import

Allow users to bring recipes into the planner from other sources:

- Paste a recipe webpage URL.
- Paste raw recipe text.
- Import a personal recipe.
- Share or paste recipes from TikTok.
- Share or paste recipes from Instagram.
- Extract a structured recipe from supported social content.

Imported recipes could then be mixed with generated recipes and previous favorites during weekly planning.

### Additional Grocery Retailers

Potential future integrations include:

- Walmart.
- Instacart, if appropriate API access is available.
- Other grocery retailers with supported developer APIs or partnerships.

### Budget Optimization

Allow the user to specify constraints such as:

> "Keep dinners under $60 this week."

The system could then optimize:

- Meal choice.
- Ingredient overlap.
- Pantry usage.
- Product selection.
- Package sizes.

### Nutrition Modes

Optional planning preferences could include:

- High protein.
- Lower calorie.
- Low carb.
- Vegetarian.
- Mediterranean.
- Cutting.
- Bulking.

These should remain optional rather than turning the application into a calorie-tracking platform.

### Waste Reduction

The system could estimate:

- What ingredients remain after recipes.
- Which ingredients are likely to expire soon.
- Which future recipes can reuse leftovers.
- Whether buying a different package size would reduce waste.

### Household Collaboration

Future household features could include:

- Multiple household members.
- Shared pantry state.
- Separate likes and dislikes.
- Meal voting.
- Shared grocery lists.
- Real-time updates.

### Pantry Automation

Possible future input methods:

- Receipt scanning.
- Barcode scanning.
- Grocery-order history import.
- Pantry or refrigerator photo recognition.

### Scheduling and Planning

Possible additions:

- Calendar integration.
- Assign meals to specific days.
- Account for busy evenings.
- Leftover scheduling.
- Breakfast and lunch planning.
- Meal-prep modes.

### Cooking Assistance

Possible additions:

- Cooking timers.
- Step-by-step cook mode.
- Voice guidance.
- Ingredient substitutions.
- Scaling recipes during cooking.

---

## 11. Technical Direction

The project should be designed as a **responsive web application** with a shared TypeScript-based development environment.

### Possible Frontend

- React or Next.js.
- TypeScript.
- Responsive web design.
- Component-based UI.

### Possible Backend

A backend service should handle:

- Authentication.
- User preferences.
- Pantry state.
- Meal plans.
- Recipe storage.
- AI calls.
- Grocery calculations.
- Kroger OAuth.
- Kroger API requests.
- Product matching.
- Cart submission.

A possible stack is:

- Supabase.
- PostgreSQL.
- Supabase Auth.
- Server-side TypeScript / Next.js API routes / Edge Functions.

The final stack can be adjusted by the team as implementation begins.

### High-Level Data Entities

- User
- Household
- Preference
- Ingredient
- PantryItem
- Recipe
- MealPlan
- PlannedMeal
- GroceryRequirement
- StoreProduct
- CartSubmission
- MealFeedback
- ImportedRecipe

---

## 12. AI Architecture

The AI component should return **structured data**, not free-form application state.

Example:

```json
{
  "week": {
    "meals": [
      {
        "recipe_id": "recipe_123",
        "servings": 2,
        "reason": "Uses spinach already in the kitchen and shares Parmesan with another meal."
      }
    ]
  }
}
```

Application code should then perform the deterministic workflow:

1. Load recipe ingredients.
2. Normalize ingredient names and units.
3. Calculate quantities.
4. Compare requirements with pantry data.
5. Build grocery requirements.
6. Search retailer products.
7. Select or rank possible product matches.
8. Let the user review matches.
9. Submit approved products to the retailer.

The AI should assist with planning and interpretation, but it should not control final grocery quantities or cart math.

---

## 13. Suggested Development Milestones

### Milestone 1 — Recipe to Grocery Cart

Prove the hardest external workflow first:

- One known recipe.
- Ingredient requirements.
- Kroger authorization.
- Store selection.
- Product search.
- Product matching.
- Product review.
- Add products to cart.
- Open Kroger for checkout.

### Milestone 2 — Weekly Meal Planning

Add:

- User accounts.
- Preferences.
- Weekly meal generation.
- 3–5 meals.
- Individual meal swapping.
- Recipe data.
- Grocery consolidation.
- Existing Kroger workflow.

At this point, a user should be able to plan and shop for one real week.

### Milestone 3 — Pantry Awareness

Add:

- Pantry items.
- Staples.
- Natural-language pantry entry.
- Pantry-aware planning.
- Pre-shopping kitchen check.
- Post-shopping updates.
- Post-cooking updates.

### Milestone 4 — Personalization and Polish

Add:

- Meal ratings.
- Favorites.
- Previous-week awareness.
- Better preference learning.
- Use-soon ingredients.
- Selected stretch features.

---

## 14. Success Criteria

The project is successful if a user can repeatedly complete the following loop:

> **Set preferences → generate meals → adjust the plan → review groceries → match store products → add products to cart → cook meals → return for the next week**

Key questions to evaluate:

- Do users find the generated meal plans useful?
- Can a user easily modify the plan without starting over?
- Are grocery requirements calculated correctly?
- Are retailer product matches accurate enough to be useful?
- Does pantry awareness prevent unnecessary purchases?
- Does the workflow reduce the time required to plan meals and groceries?
- Can the system improve recommendations using previous user feedback?
- Can users successfully return and repeat the workflow in a later week?

---

## 15. Scope Boundaries

The senior-design MVP should **not require**:

- Multiple grocery retailers.
- Automatic grocery checkout or payment.
- Delivery tracking.
- Full calorie or macro tracking.
- Medical or nutrition coaching.
- Public social profiles.
- Recipe creator tools.
- A social recipe feed.
- Shared family accounts.
- Real-time collaborative grocery editing.
- Receipt scanning.
- Barcode scanning.
- Pantry image recognition.
- Restaurant recommendations.
- Smart-home integrations.
- Native iOS or Android applications.

These can remain future extensions if the team completes the required system early.

---

## 16. Working Brand / Name

The project name is **not finalized** and should not define the product requirements.

**Plenly** can remain a working name during development, but other possibilities could include:

- **Mealflow**
- **Weekful**
- **PantryPlan**
- **Tablewise**
- **MealPilot**
- **Gather**
- **Plantry**
- **Weekplate**

Any final name should be checked for domain, App Store, trademark, and existing-product conflicts before adoption.

Regardless of name, the product should feel:

- Simple.
- Organized.
- Helpful.
- Modern.
- Food-focused rather than AI-focused.

AI should mostly operate behind the scenes rather than being the product's identity.

---

## 17. One-Sentence Project Definition

> **A web application that plans a user's weekly meals around their preferences and available ingredients, builds the remaining grocery requirements, and helps move those groceries into an online retailer cart.**

---

## 18. Project North Star

The strongest version of this project is not simply a collection of recipes.

It is a system that reduces the amount of work required to decide what to eat, understand what is already available, determine what needs to be purchased, and prepare a grocery order.

Over time, the system should become better at producing weekly plans that fit the household with less input from the user.