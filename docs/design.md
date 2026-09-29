# Plantry Design System and UI Guide

This document describes the visual language, interface patterns, and product experience for Plantry. It records the current implementation and gives future screens a consistent direction. The product brief in [`project-overview.md`](./project-overview.md) remains the source for product scope; the implemented color and typography tokens live in [`app/globals.css`](../app/globals.css).

> **Implementation status:** The repo was reset to a small foundation: the landing hero, account forms, and an empty signed-in page. Screens marked "implemented" below were built in slice 1. That code (onboarding, household overview, the full landing page, `FoodTile`, `PantryStateBadge`, `WeekPreview`) is kept in the `slice-1-reference` git tag and summarized in [`slice-1-reference.md`](./slice-1-reference.md). Meal generation, recipe detail, pantry editing, grocery planning, and Kroger connection are planned. Examples shown in the marketing preview are illustrative sample data.

## 1. Product and brand direction

Plantry helps a household decide what to cook, use food already on hand, assemble a grocery list, and prepare a retailer cart. The experience should feel like a calm, capable kitchen companion: food-focused, organized, warm, and practical. AI is an implementation detail and should not become the visual identity or the user's main task.

Design around these principles:

- **Reduce weekly effort.** Make the path from preferences to a reviewed grocery cart easy to understand and short to complete.
- **Plan the week as a whole.** Show useful connections between meals, ingredients, leftovers, and what is already in the kitchen.
- **Treat pantry data as approximate.** Let people say they have an item, are running low, are out, or are unsure; do not demand exact inventory maintenance.
- **Keep the person in control.** Make the plan, grocery list, product matches, and retailer handoff reviewable. Never imply that a product reaches an external cart without approval.
- **Use plain, encouraging language.** Explain the benefit in everyday cooking terms. Avoid technical AI language, guilt about food waste, or pressure to follow a rigid schedule.

The current working name and wordmark are **Plantry**. The supplied brand pairs a food basket (leaves, tomato, and jar) with a bold, rounded forest-green wordmark and a capital P. Use the transparent color mark and wordmark on light surfaces. Use the cream-on-green badge for compact icons and dark brand panels. Assets live in `public/brand/`; `components/logo.tsx` provides the shared lockup and color/badge mark variants. `app/icon.png` and `app/apple-icon.png` use the green badge for browser tabs and Apple home-screen bookmarks.

## 2. Visual language

The interface uses a warm cream canvas, dark green text, white surfaces, soft borders, and a restrained set of food-inspired colors. Large Fraunces headings give the product a friendly editorial character; Geist keeps forms, labels, and dense details clear. Rounded shapes and subtle shadows make the UI approachable without making every section feel like a floating panel.

Use color washes sparingly for decorative hero backgrounds. Use solid token colors for controls, badges, and status. Keep layouts open, with clear section headings and short supporting text. The current product uses Lucide icons and softly tinted icon tiles in place of meal photography; those tiles are illustrative and should not be mistaken for real recipe images.

## 3. Color tokens

Hex values below are the current light-theme values from `app/globals.css`. Use semantic tokens for common UI roles so the interface remains consistent if the palette changes.

### Neutral and semantic colors

| Token                  | Hex       | Use                                                           |
| ---------------------- | --------- | ------------------------------------------------------------- |
| `background`           | `#FBF8F3` | Main warm page canvas                                         |
| `foreground`           | `#1C2920` | Primary text and dark ink                                     |
| `card`                 | `#FFFFFF` | Cards, inputs, popovers, and raised surfaces                  |
| `card-foreground`      | `#1C2920` | Text on cards                                                 |
| `popover`              | `#FFFFFF` | Popover surface                                               |
| `popover-foreground`   | `#1C2920` | Popover text                                                  |
| `primary`              | `#2F5D3A` | Main actions, selected controls, progress, and brand surfaces |
| `primary-foreground`   | `#FBF8F3` | Text and icons on primary surfaces                            |
| `secondary`            | `#F1EBE0` | Quiet button fills and grouped-control backgrounds            |
| `secondary-foreground` | `#1C2920` | Text on secondary surfaces                                    |
| `muted`                | `#F4EFE7` | Quiet surface fills                                           |
| `muted-foreground`     | `#6A6F66` | Supporting labels and secondary text                          |
| `accent`               | `#E6EFE1` | Soft green accent surface                                     |
| `accent-foreground`    | `#1C2920` | Text on accent surfaces                                       |
| `destructive`          | `#C2410C` | Destructive or invalid controls                               |
| `border`               | `#EBE3D6` | Default borders and separators                                |
| `input`                | `#E1D8C9` | Form-control borders                                          |
| `ring`                 | `#2F5D3A` | Keyboard focus ring                                           |

### Food palette

Each hue has a saturated base, a pale surface, and a darker ink color. Pair the ink with its matching soft surface for labels and badges. Do not communicate a status through color alone; include a word or another clear indicator.

| Tone    | Base      | Soft surface | Ink       | Current meaning                                               |
| ------- | --------- | ------------ | --------- | ------------------------------------------------------------- |
| Tomato  | `#E4572E` | `#FDE6DC`    | `#B8401C` | Warm food accent; also the “Out” pantry state and form errors |
| Saffron | `#F2A93B` | `#FCEFD3`    | `#A4670F` | Highlights, “Running low,” and upcoming states                |
| Sage    | `#5B8A5F` | `#E2EEDD`    | `#37633F` | Positive food signals, “Have,” and completed states           |
| Plum    | `#9B4D6E` | `#F5E2EA`    | `#843A5A` | “Unsure” pantry state and restriction tags                    |
| Sky     | `#3F7EA6` | `#DEEDF5`    | `#2C6588` | Informational or cool-toned food and kitchen icons            |

### Pantry-state mapping

| State    | Label       | Tone    |
| -------- | ----------- | ------- |
| `have`   | Have        | Sage    |
| `low`    | Running low | Saffron |
| `out`    | Out         | Tomato  |
| `unsure` | Unsure      | Plum    |

Slice 1 defined this mapping in `components/pantry-state-badge.tsx` (see the `slice-1-reference` tag). Restore it and reuse it anywhere pantry availability appears.

## 4. Typography

- **Brand title:** Use the supplied `plantry-wordmark.png` lettering in the shared `Logo` component rather than typing Plantry in a substitute font. The wordmark is distinct from the page-heading font.
- **Display:** Fraunces, loaded with normal and italic styles plus the `SOFT` and `opsz` axes. Use `font-display` for page titles, section titles, and selected numeric display values. The base display style sets `SOFT` to 60 and letter spacing to `-0.02em`.
- **Interface and body:** Geist, loaded as the sans-serif family. Use it for paragraphs, controls, navigation, labels, metadata, and dense information.
- **Body rendering:** The page uses antialiasing and Geist's `ss01` and `cv11` font features.
- **Emphasis:** Italic Fraunces is a brand accent for a short phrase, not a default paragraph style. Keep body copy readable and sentence case; reserve uppercase, tracked text for small eyebrows and metadata.

Common implemented sizes include 4xl–5xl page headings, xl card titles, base/large supporting copy, and small labels at 11–14px. Follow the hierarchy already established on the landing, login, onboarding, and dashboard screens instead of adding many one-off sizes.

## 5. Shape, spacing, depth, and iconography

- **Base radius:** `--radius: 0.875rem`. Components use larger radii for larger surfaces: rounded-xl inputs, rounded-2xl controls and inner panels, rounded-3xl cards, and pill-shaped buttons and badges.
- **Content width:** Marketing and signed-in pages use a `max-w-6xl` content area. Onboarding uses `max-w-3xl`; account forms use `max-w-sm`.
- **Spacing:** Use the Tailwind spacing scale already in the project. Favor generous separation between major sections and tighter spacing within a control group.
- **Borders:** Use the warm `border` and `input` tokens. Borders should define structure gently; avoid heavy outlines around every nested element.
- **Shadows:** Keep elevation subtle. Cards use a faint edge shadow; primary buttons use a restrained green shadow. Reserve larger shadows for the featured week preview or a clearly elevated overlay.
- **Icons:** Use Lucide React with consistent stroke weight. Pair meaningful icons with text labels. A decorative icon may stand alone only when adjacent text already provides the meaning or it is explicitly hidden from assistive technology.
- **Food tiles:** `FoodTile` is a reusable rounded square containing a Lucide icon on a tone-matched pale background. Use it for food categories, kitchen concepts, and compact visual anchors. Do not present it as a photograph or as proof of a specific recipe.

## 6. Component patterns

The shared primitives live in `components/ui/`; feature-level food components live in `components/`.

### Buttons

Buttons are pill-shaped and use medium-weight text. Available variants are:

- **Default:** Forest green; primary action.
- **Accent:** Tomato; use selectively for a distinct warm action.
- **Outline:** White surface with an input-colored border; secondary action.
- **Secondary:** Oat-colored fill; quiet but visible action.
- **Ghost:** Minimal fill; navigation or low-emphasis action.
- **Link:** Text-only link treatment.

Sizes are small (36px high), default (44px), large (52px), and icon (40px square). Keep one clear primary action per decision area. Disabled buttons use reduced opacity and should have nearby explanatory copy if the reason is not obvious.

### Cards and badges

- **Cards** use a white surface, warm border, rounded-3xl corners, and a soft shadow. The shared card subcomponents provide a consistent header, title, description, and content padding.
- **Badges** are compact pills. Use neutral for generic metadata and the food tones for meaningful categories or statuses. Keep badge text concise.
- **Selected chips** use the primary fill and a checkmark; unselected chips use a white surface and border.
- **Option cards** use a border, rounded-2xl shape, title, optional icon and description, and a visible checked state. Keep the entire card clickable.

### Forms and selection controls

- Inputs are 48px high, white, rounded-xl, and use a warm border. Focus strengthens the border and adds a soft green ring; invalid input uses the destructive token.
- Labels sit above their controls. Supporting hints sit close to the label and explain a choice without repeating it.
- Steppers use a bordered white group, large Fraunces value, and separately labeled increase/decrease buttons.
- Tag inputs show entered items as removable pills, offer quick-add suggestions, and accept Enter or comma as an add action.
- Use visible selected states, native button behavior, and appropriate `aria-pressed`, `aria-checked`, or radio-group semantics.

## 7. Responsive layout

The product is a responsive web application. Design mobile-first and progressively use the existing Tailwind breakpoints:

- Stack page sections and cards on narrow screens; let chip and badge groups wrap.
- The marketing hero becomes a single column on small screens and a two-column layout at `lg`. The desktop preview cards are decorative and may be hidden on smaller screens when they would crowd the content.
- Marketing feature cards move from a single column to two columns at `sm`, then use a three-column composition at `lg`.
- Onboarding keeps a centered reading width. Progress bars remain visible on mobile while their text labels appear from `sm`; the bottom action bar stays available while progressing through long forms.
- The account experience stacks on mobile and becomes a form-plus-brand-panel layout at `lg`.
- The dashboard uses a single column on mobile and a two-thirds/one-third content split at `lg`.

Keep page gutters consistent with the current `px-6` pattern. Prevent horizontal scrolling when long recipe names, ingredient tags, or retailer product details are introduced.

## 8. Screen and journey design

### Public landing page — implemented

The sticky header carries the logo, in-page links, and login/get-started actions. The hero states the dinner-planning benefit, gives a direct signup or dashboard action, and shows an illustrative weekly plan preview. Follow it with a four-step “How it works” section, feature cards about coordinated meals, approximate pantry tracking, consolidated shopping, and user approval, then a closing call to action and compact project footer.

The preview's sample meals and grocery counts are mock data (`WeekPreview`). Keep this distinction clear if the mockup is reused outside marketing.

### Sign in and account creation — implemented

Use a centered, narrow form on the left and a deep-green brand panel with the week preview on wide screens. On narrow screens, show the form without the large decorative panel. A segmented control switches between sign-in and account creation. Include visible labels, password visibility control, pending state, inline errors, and an inbox-confirmation success state.

### First-time setup — implemented

The onboarding sequence has four steps with progress, a compact brand header, and a persistent bottom action bar:

1. **Household:** Name, number of people, and dinners per week.
2. **Tastes:** Preferred cuisines, dietary requirements, and ingredients or dishes to avoid.
3. **Routine:** Weeknight cooking time, cooking confidence, leftovers preference, and budget.
4. **Kitchen:** Usual staples and ingredients the household would like to use soon.

Use clear, conversational questions. Explain that pantry information can be approximate. Keep back/continue actions predictable, preserve entered values while moving between steps, show saving progress, and surface validation or server errors next to the action area.

### Household overview — implemented, partly a placeholder

The signed-in shell has a sticky header, logo, overview navigation, account name, and sign-out action. The page summarizes the current week, preferences, kitchen staples, ingredients to use soon, weekly planning rhythm, and future store connection. At present, the Meal plan, Kitchen, and Groceries navigation items and planning/store buttons are marked “Coming soon”; dinner slots are placeholders. Keep these limitations apparent until those flows are implemented.

### Weekly plan — planned

The target workflow lets the user review dinners for the week, swap or lock a meal, add or remove a meal, adjust servings, and mark a night as leftovers or eating out. Organize meals by day with the meal name, cook time, servings, and a concise reason it fits (for example, uses an item on hand or shares an ingredient with another dinner). Preserve locked meals during regeneration and make plan approval explicit.

### Kitchen review — planned

Provide a quick list of ingredients that affect the current plan. Let users mark each as Have, Running low, Out, or Unsure. Make uncertain items easy to resolve without turning the flow into inventory bookkeeping. Keep staple management and “use soon” items visible but secondary to the current review.

### Grocery list and retailer handoff — planned

Group consolidated ingredients into an easy-to-scan list, show useful quantities and which meals need each item, and account for items already in the kitchen. Separate ingredient requirements from retailer product matches. Let users inspect and replace product choices before a distinct confirmation action adds approved items to the retailer cart. Send checkout to the retailer; do not imply that Plantry completes retailer checkout.

### Recipe, shopping, and cooking follow-up — planned

Recipe detail should prioritize ingredients, servings, cooking time, and clear numbered instructions. After shopping, let the user confirm what actually came home; after cooking, offer lightweight meal feedback and pantry updates. These actions should be optional and quick.

## 9. Interaction, feedback, and accessibility

- Provide visible hover, focus, selected, disabled, pending, success, error, and empty states. A disabled state should not be the only explanation for unavailable functionality.
- Use the shared green focus ring for keyboard navigation and keep a visible focus indicator on every interactive element.
- Respect reduced-motion preferences. The current theme defines a short fade-up entrance and gentle floating decoration; decorative motion must not carry essential information.
- Use semantic headings, lists, landmarks, and navigation labels. Keep field labels programmatically associated with their controls. Announce dynamic errors and status changes where appropriate.
- Do not rely on tone alone for pantry status, selected choices, errors, or progress. Keep the visible label or icon alongside color.
- Use the darker `*-ink` colors for text on their corresponding soft food-color fills. Check text and control contrast when adding new token combinations; the token list itself is not a contrast audit.
- Keep controls comfortably tappable. The shared icon button is 40px square; use at least that footprint for compact icon-only actions and provide an accessible name.
- Avoid layout shifts when loading or saving. Preserve entered data on recoverable errors and explain what the user can do next.

## 10. Design source of truth and update notes

When changing the design, update the shared tokens and components first rather than scattering new colors or styles across pages.

- **Colors, fonts, global radius, animation, base styles:** `app/globals.css`
- **Font loading and page metadata:** `app/layout.tsx`
- **Shared controls:** `components/ui/`
- **Brand mark:** `components/logo.tsx` (food tiles and pantry-state badges are in the `slice-1-reference` tag)
- **Current routes:** `app/page.tsx`, `app/login/`, `app/(app)/` (signed-in pages, starting with `dashboard/`)
- **Product requirements and intended MVP:** [`project-overview.md`](./project-overview.md)

Keep this guide aligned with both the implementation and the product brief. Mark new flows as planned until their real interaction and state behavior exists in the app.
