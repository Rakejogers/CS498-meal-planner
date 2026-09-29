# Initial User Stories

These user stories describe the core functionality of our web-based meal planning and grocery assistant. Ownership is currently divided evenly across six team members; the placeholder member names can be replaced with actual team member names before submission.

---

## User Story 1 — Set Meal Preferences

**Owner: Member A**

**As a new user,**
**I want to specify my food preferences and dietary restrictions**
**so that the meals recommended to me fit what I can and want to eat.**

### Acceptance Criteria

* **Given** that I am setting up or editing my profile,
  **When** I enter foods I like, dislike, or cannot eat,
  **Then** those preferences are saved to my account.

* **Given** that I have saved dietary restrictions or disliked foods,
  **When** a meal plan is generated,
  **Then** the generated meals should respect those restrictions and preferences.

---

## User Story 2 — Set Household and Serving Size

**Owner: Member B**

**As a user,**
**I want to specify how many people I normally cook for**
**so that recipes and grocery quantities are appropriate for my household.**

### Acceptance Criteria

* **Given** that I am editing my profile,
  **When** I select my household size,
  **Then** that value is saved as my default serving count.

* **Given** that my household size is saved,
  **When** a recipe is added to my weekly plan,
  **Then** its ingredient quantities should be scaled to the correct number of servings.

---

## User Story 3 — Generate a Weekly Meal Plan

**Owner: Member C**

**As a user,**
**I want the application to automatically generate several dinners for my upcoming week**
**so that I do not have to decide what to cook from scratch.**

### Acceptance Criteria

* **Given** that I have saved my meal preferences,
  **When** I request a new weekly meal plan,
  **Then** the system generates approximately 3–5 meals.

* **Given** that meals have been generated,
  **When** I view my weekly plan,
  **Then** I can see the name and basic information for each meal.

* **Given** that I have restrictions or preferences saved,
  **When** the plan is generated,
  **Then** the generated meals should take those settings into account.

---

## User Story 4 — Swap an Individual Meal

**Owner: Member D**

**As a user,**
**I want to replace one meal that I do not want**
**so that I can adjust my plan without regenerating the entire week.**

### Acceptance Criteria

* **Given** that I have a generated weekly meal plan,
  **When** I choose to swap one meal,
  **Then** the system provides a replacement meal.

* **Given** that I swap one meal,
  **When** the replacement is generated,
  **Then** the other meals in my weekly plan remain unchanged.

---

## User Story 5 — Track Pantry Ingredients

**Owner: Member E**

**As a user,**
**I want to record ingredients that I already have at home**
**so that the system does not unnecessarily tell me to buy them again.**

### Acceptance Criteria

* **Given** that I am viewing my kitchen or pantry,
  **When** I add an ingredient,
  **Then** that ingredient is stored in my pantry.

* **Given** that an ingredient is in my pantry,
  **When** I update it,
  **Then** I can mark it as **Have, Running Low, Out, or Unsure**.

* **Given** that I return to the application later,
  **When** I open my pantry,
  **Then** my previously saved pantry items are still available.

---

## User Story 6 — Use Pantry Ingredients in Meal Planning

**Owner: Member F**

**As a user,**
**I want meal suggestions to consider ingredients that I already have**
**so that I can use existing food and reduce unnecessary purchases or waste.**

### Acceptance Criteria

* **Given** that I have ingredients marked as available in my pantry,
  **When** a weekly meal plan is generated,
  **Then** those ingredients can be considered when selecting meals.

* **Given** that a meal uses an ingredient I already have,
  **When** I view the recipe,
  **Then** the system should indicate that the ingredient is already available.

---

## User Story 7 — View Recipe Details

**Owner: Member A**

**As a user,**
**I want to view the recipe for each planned meal**
**so that I know what ingredients I need and how to prepare the meal.**

### Acceptance Criteria

* **Given** that a meal is part of my weekly plan,
  **When** I open that meal,
  **Then** I can see its ingredient list.

* **Given** that I am viewing a recipe,
  **When** the recipe loads,
  **Then** I can see its cooking instructions, serving count, and estimated cooking time.

---

## User Story 8 — Create a Combined Grocery List

**Owner: Member B**

**As a user,**
**I want ingredients from all of my planned meals combined into one grocery list**
**so that I do not have to manually combine ingredients from several recipes.**

### Acceptance Criteria

* **Given** that I have approved multiple meals for the week,
  **When** I generate my grocery list,
  **Then** ingredients from every planned recipe are included.

* **Given** that multiple recipes require the same ingredient,
  **When** the grocery list is generated,
  **Then** the ingredient appears as a combined grocery requirement instead of unnecessary duplicate entries.

* **Given** that ingredient quantities can be combined,
  **When** duplicates are merged,
  **Then** the required quantity should reflect the total needed across the recipes.

---

## User Story 9 — Account for Pantry Items in Grocery Planning

**Owner: Member C**

**As a user,**
**I want my grocery list to account for ingredients I already have**
**so that I only shop for ingredients I actually need.**

### Acceptance Criteria

* **Given** that an ingredient is marked **Have** in my pantry,
  **When** the grocery list is generated,
  **Then** the system should not automatically add the full ingredient requirement to my shopping list.

* **Given** that an ingredient is marked **Unsure** or **Running Low**,
  **When** the grocery list is generated,
  **Then** the system should identify the ingredient for me to review.

* **Given** that I determine I need an uncertain ingredient,
  **When** I confirm that it should be purchased,
  **Then** it is added to my shopping list.

---

## User Story 10 — Match Ingredients to Grocery Products

**Owner: Member D**

**As a grocery shopper,**
**I want ingredients on my grocery list matched with real products at my selected grocery store**
**so that I do not have to manually search for every product myself.**

### Acceptance Criteria

* **Given** that I have generated a grocery list and selected a supported store,
  **When** I request grocery product matches,
  **Then** the system searches for products corresponding to the ingredients I need.

* **Given** that a product match is found,
  **When** I review the grocery list,
  **Then** I can see the matched product before it is added to an external cart.

* **Given** that no appropriate match is found,
  **When** I review that grocery item,
  **Then** the application should indicate that the item still needs attention rather than silently choosing an incorrect product.

---

## User Story 11 — Replace a Grocery Product Match

**Owner: Member E**

**As a user,**
**I want to replace a grocery product selected by the system**
**so that I remain in control of the specific products I purchase.**

### Acceptance Criteria

* **Given** that the system has selected a product for an ingredient,
  **When** I choose to replace that product,
  **Then** I can view alternative matching products.

* **Given** that alternative products are available,
  **When** I choose a different product,
  **Then** the new product replaces the original selection.

* **Given** that I do not want to purchase an item,
  **When** I remove it,
  **Then** it is excluded from the products that will be sent to the retailer cart.

---

## User Story 12 — Add Approved Groceries to Retailer Cart

**Owner: Member F**

**As a user,**
**I want to send my approved grocery products to my retailer cart**
**so that I can complete my normal grocery checkout without manually rebuilding the cart.**

### Acceptance Criteria

* **Given** that I have reviewed my matched grocery products,
  **When** I approve the products and choose to add them to my retailer cart,
  **Then** the application submits the approved products to the retailer.

* **Given** that I removed or rejected a product before submission,
  **When** the cart is created,
  **Then** that product is not submitted.

* **Given** that the products were successfully submitted,
  **When** the process is complete,
  **Then** I can continue to the retailer to review the cart and complete checkout normally.

---

## Team Ownership Summary

| Team Member | User Stories                                                                            |
| ----------- | --------------------------------------------------------------------------------------- |
| Member A    | 1. Set Meal Preferences; 7. View Recipe Details                                         |
| Member B    | 2. Set Household and Serving Size; 8. Create a Combined Grocery List                    |
| Member C    | 3. Generate a Weekly Meal Plan; 9. Account for Pantry Items in Grocery Planning         |
| Member D    | 4. Swap an Individual Meal; 10. Match Ingredients to Grocery Products                   |
| Member E    | 5. Track Pantry Ingredients; 11. Replace a Grocery Product Match                        |
| Member F    | 6. Use Pantry Ingredients in Meal Planning; 12. Add Approved Groceries to Retailer Cart |
