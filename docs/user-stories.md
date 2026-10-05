# CS 498 - Initial User Stories

## 1. Set Meal Preferences
**Owner: Jake**

As a new user, I want to specify my food preferences and dietary restrictions so that the meals recommended to me fit what I can and want to eat.

### Acceptance Criteria
1. Given that I am setting up or editing my profile, when I enter foods I like, dislike, or cannot eat, then those preferences are saved to my account.
2. Given that I have saved dietary restrictions or disliked foods, when a meal plan is generated, then the generated meals should respect those restrictions and preferences.

## 2. Set Household and Serving Size
**Owner: Nate**

As a user, I want to specify how many people I normally cook for so that recipes and grocery quantities are appropriate for my household.

### Acceptance Criteria
1. Given that I am editing my profile, when I select my household size, then that value is saved as my default serving count.
2. Given that my household size is saved, when a recipe is added to my weekly plan, then its ingredient quantities should be scaled to the correct number of servings.

## 3. Generate a Weekly Meal Plan
**Owner: Ben**

As a user, I want the application to automatically generate several dinners for my upcoming week so that I do not have to decide what to cook from scratch.

### Acceptance Criteria
1. Given that I have saved my meal preferences, when I request a new weekly meal plan, then the system generates approximately 3-5 meals.
2. Given that meals have been generated, when I view my weekly plan, then I can see the name and basic information for each meal.
3. Given that I have restrictions or preferences saved, when the plan is generated, then the generated meals should take those settings into account.

## 4. Swap an Individual Meal
**Owner: Colten**

As a user, I want to replace one meal that I do not want so that I can adjust my plan without regenerating the entire week.

### Acceptance Criteria
1. Given that I have a generated weekly meal plan, when I choose to swap one meal, then the system provides a replacement meal.
2. Given that I swap one meal, when the replacement is generated, then the other meals in my weekly plan remain unchanged.

## 5. Track Pantry Ingredients
**Owner: Mustafa**

As a user, I want to record ingredients that I already have at home so that the system does not unnecessarily tell me to buy them again.

### Acceptance Criteria
1. Given that I am viewing my kitchen or pantry, when I add an ingredient, then that ingredient is stored in my pantry.
2. Given that an ingredient is in my pantry, when I update it, then I can mark it as Have, Running Low, Out, or Unsure.
3. Given that I return to the application later, when I open my pantry, then my previously saved pantry items are still available.

## 6. Use Pantry Ingredients in Meal Planning
**Owner: Olivia**

As a user, I want meal suggestions to consider ingredients that I already have so that I can use existing food and reduce unnecessary purchases or waste.

### Acceptance Criteria
1. Given that I have ingredients marked as available in my pantry, when a weekly meal plan is generated, then those ingredients can be considered when selecting meals.
2. Given that a meal uses an ingredient I already have, when I view the recipe, then the system should indicate that the ingredient is already available.

## 7. View Recipe Details
**Owner: Jake**

As a user, I want to view the recipe for each planned meal so that I know what ingredients I need and how to prepare the meal.

### Acceptance Criteria
1. Given that a meal is part of my weekly plan, when I open that meal, then I can see its ingredient list.
2. Given that I am viewing a recipe, when the recipe loads, then I can see its cooking instructions, serving count, and estimated cooking time.

## 8. Create a Combined Grocery List
**Owner: Nate**

As a user, I want ingredients from all of my planned meals combined into one grocery list so that I do not have to manually combine ingredients from several recipes.

### Acceptance Criteria
1. Given that I have approved multiple meals for the week, when I generate my grocery list, then ingredients from every planned recipe are included.
2. Given that multiple recipes require the same ingredient, when the grocery list is generated, then the ingredient appears as a combined grocery requirement instead of unnecessary duplicate entries.
3. Given that ingredient quantities can be combined, when duplicates are merged, then the required quantity should reflect the total needed across the recipes.

## 9. Account for Pantry Items in Grocery Planning
**Owner: Ben**

As a user, I want my grocery list to account for ingredients I already have so that I only shop for ingredients I actually need.

### Acceptance Criteria
1. Given that an ingredient is marked Have in my pantry, when the grocery list is generated, then the system should not automatically add the full ingredient requirement to my shopping list.
2. Given that an ingredient is marked Unsure or Running Low, when the grocery list is generated, then the system should identify the ingredient for me to review.
3. Given that I determine I need an uncertain ingredient, when I confirm that it should be purchased, then it is added to my shopping list.

## 10. Match Ingredients to Grocery Products
**Owner: Colten**

As a grocery shopper, I want ingredients on my grocery list matched with real products at my selected grocery store so that I do not have to manually search for every product myself.

### Acceptance Criteria
1. Given that I have generated a grocery list and selected a supported store, when I request grocery product matches, then the system searches for products corresponding to the ingredients I need.
2. Given that a product match is found, when I review the grocery list, then I can see the matched product before it is added to an external cart.
3. Given that no appropriate match is found, when I review that grocery item, then the application should indicate that the item still needs attention rather than silently choosing an incorrect product.

## 11. Replace a Grocery Product Match
**Owner: Mustafa**

As a user, I want to replace a grocery product selected by the system so that I remain in control of the specific products I purchase.

### Acceptance Criteria
1. Given that the system has selected a product for an ingredient, when I choose to replace that product, then I can view alternative matching products.
2. Given that alternative products are available, when I choose a different product, then the new product replaces the original selection.
3. Given that I do not want to purchase an item, when I remove it, then it is excluded from the products that will be sent to the retailer cart.

## 12. Add Approved Groceries to Retailer Cart
**Owner: Olivia**

As a user, I want to send my approved grocery products to my retailer cart so that I can complete my normal grocery checkout without manually rebuilding the cart.

### Acceptance Criteria
1. Given that I have reviewed my matched grocery products, when I approve the products and choose to add them to my retailer cart, then the application submits the approved products to the retailer.
2. Given that I removed or rejected a product before submission, when the cart is created, then that product is not submitted.
3. Given that the products were successfully submitted, when the process is complete, then I can continue to the retailer to review the cart and complete checkout normally.

## Team Ownership Summary

- Jake: User Stories 1 and 7
- Nate: User Stories 2 and 8
- Ben: User Stories 3 and 9
- Colten: User Stories 4 and 10
- Mustafa: User Stories 5 and 11
- Olivia: User Stories 6 and 12
