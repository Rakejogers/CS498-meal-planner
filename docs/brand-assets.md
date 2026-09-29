# Plantry brand assets

The brand uses the grocery basket logo and bold, rounded Plantry wordmark supplied on September 28, 2026. Use the shared `Logo` component for the name and symbol together. Keep Fraunces for page headings; the brand name is rendered from the wordmark asset rather than a substitute font.

| Asset                               | Source and use                                                                                                                                                     |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `public/brand/plantry-mark.png`     | Unmodified supplied transparent color logo Light header and footer surfaces.                                   |
| `public/brand/plantry-wordmark.png` | Transparent wordmark
| `public/brand/plantry-badge.png`    | Opaque cream-on-green. Account brand panel and site icons. |
| `app/icon.png`                      | 192px browser icon derived from the badge.                                                                                                                         |
| `app/apple-icon.png`                | 180px Apple touch icon derived from the badge.                                                                                                                     |

The shared component crops the transparent assets' outer padding in CSS, sets explicit image dimensions, and gives the logo link the accessible name "Plantry home". Next.js optimizes the images for their displayed sizes. The icon exports only resize the selected badge.

## Image Gen prompts

Wordmark:

> Use case: background-extraction. Edit target: the provided Plantry branding sheet. Asset type: transparent website wordmark PNG. Extract ONLY the dark forest-green word 'Plantry' from the large central logo, preserving the exact supplied letter shapes, capital P, rounded bold type style, proportions, and green color. Remove all basket graphics and the two small icons and remove the off-white background to genuine alpha transparency. Output just the original word 'Plantry', tightly framed horizontally with minimal transparent padding. Do not redesign the lettering, do not add a symbol, do not add text. This is a faithful extraction of the existing wordmark for implementation.

Selected green badge export:

> Edit target: supplied Plantry logo icon. Produce a clean favicon asset. Output an entirely solid opaque forest-green square background #284C35 with the EXACT existing off-white basket, two leaves, tomato and jar logo centered as in this reference. Crop away the surrounding off-white page. Preserve original logo shapes and spacing, same scale as the original relative to the green square. The solid green background must be uniform and fully opaque everywhere behind the off-white symbol, all the way to square corners. No texture, shadows, holes, transparent areas, glow, mottling, wordmark or additional detail. This is a faithful clean export of the supplied green icon for browser favicon and Apple icon.
