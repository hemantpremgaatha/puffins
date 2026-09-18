# Puffins Website — Phase 1 Build

Static, dependency-free HTML/CSS/JS implementing Phase 1 of the Developer Handoff brief
(Home, Shop, Product Detail ×2, Our Story, Why Puffins, FAQ, Contact, legal pages, SEO
foundation). No build step — open `index.html` directly, or serve the folder with any
static host (Netlify, Vercel, GitHub Pages, S3+CloudFront, or a simple Nginx/Apache root).

## Structure
- `index.html`, `shop.html`, `product-rice-cakes.html`, `product-rice-chips.html`,
  `our-story.html`, `why-puffins.html`, `faq.html`, `contact.html`,
  `privacy-policy.html`, `terms.html`, `shipping-returns.html`, `404.html`
- `assets/css/style.css` — single global stylesheet, CSS custom properties for the
  brand palette (`--navy #0F2740`, `--orange #FF8A00`, `--yellow #FFC257`, `--cream #FFF7EE`)
- `assets/js/main.js` — nav, accordions, tabs, form handling, product rendering
- `assets/js/products-data.js` — **the editable content source** for both products
  (flavours, pricing, ingredients, nutrition, FAQs). Update this file, not the HTML,
  to change product content. Structured to drop into a real CMS/API later — see
  "Migrating to a CMS" below.
- `assets/js/assistant-data.js` — editable Q&A content for the "Puff" chat assistant
  (see below). General business/brand answers only; product facts are read live from
  `products-data.js` so the two never drift out of sync.
- `assets/img/brand/` — logo lockups, favicons, and `packshot-sea-salt.jpg` (a clean
  crop of just the product can, taken from the pitch-deck hero slide — used for the
  home hero, product cards and product-detail gallery instead of the full slide)
- `assets/img/team/` — individual founder headshots cropped from the pitch deck's
  "Our Story" slide, used by the native team grid on `our-story.html`
- `assets/img/deck/` — original, uncropped pitch-deck slides (kept for reference /
  OG fallback only — page content should use the cropped assets above, not these)

## What's intentionally left as placeholders
Per section 19 of the brief ("Content Developer Should NOT Finalize Alone"), the
following are NOT invented and are marked `confirmed:false` in `products-data.js` or
flagged with a `.pending` notice in the UI: pricing, final flavour names/SKUs,
nutrition panel, allergen statement, shelf life, FSSAI details, company registered
address/CIN, and legal-page effective dates. Real customer reviews are also
withheld — no fake testimonials are published.

Rice Cakes' pack size (8 cakes/sleeve, 6 g each) and ingredients (rice only, pressed
at 200°C — no syrup/oil/flour) are now marked `confirmed: true`, sourced from
`specs.pdf` in the project root. Everything else in the list above is still pending
real, SIF-approved figures — flip `confirmed: true` in `assets/js/products-data.js`
(and mirror in `assets/data/products.json`) as each one is finalized, and the pending
notices disappear automatically, in the tabs and in the chat assistant below.

## "Puff" chat assistant
A floating chat widget (bottom-right, on every page) built by `initAssistant()` in
`main.js`. It's a **rule-based keyword matcher, not a hosted-LLM integration** —
this is a static, no-build, no-backend site, so there's nowhere to hold an API key
securely. It answers from:

The launcher, the chat-header avatar, and the homepage's scroll-driven walking
mascot are literally the same character — one shared SVG rig (`mascotRigMarkup()`
in `main.js`), not a lookalike icon. On the homepage, while the walking mascot is
on screen crossing the trust marquee, it *is* the clickable way to open the chat,
and the fixed launcher docks out of the way (`assistant-launcher.is-docked`) so
Puff never appears twice at once; the launcher re-docks in once the mascot exits.
Both drive the exact same panel/open-state via the `assistantAPI` handle in
`main.js`.
- `assets/js/assistant-data.js` — general business/brand Q&A (founder story, method,
  location, contact routing, honest "not published yet" answers for anything
  regulated that isn't confirmed).
- Live fields on `window.PUFFINS_PRODUCTS` (ingredients, pack size) — so once you
  flip a field to `confirmed: true` in `products-data.js`, the assistant picks it up
  automatically, same as the product-page tabs.

To wire in a real LLM-backed assistant later, add a serverless/backend endpoint
(same pattern as `initForms()` below) and have the chat form POST to it instead of
calling the local `matchTopic()` matcher — keep the same message-bubble markup.

## Migrating to a CMS / e-commerce
The product/price/inventory shape in `products-data.js` is already SKU-ready (flavours,
status, pack size, price, attributes). To go live with a real backend: replace the
`window.PUFFINS_PRODUCTS` assignment with a `fetch()` call to your CMS/headless API or
storefront (Shopify/Medusa/etc.), keep the same field names, and the rendering in
`main.js` keeps working unchanged. Wire `initForms()` in `main.js` to your form
backend/serverless endpoint before go-live (currently simulates success client-side only).

## Before launch (from the brief's Section 23 checklist)
Analytics (GA4 + Search Console) and Meta Pixel are not yet wired in — add before launch.
Canonical/OG URLs and `sitemap.xml`/`robots.txt` now point to `samrthayfoods.com` (done).
Swap footer social links (`#`) for real handles. Add real product photography
once available (`packshot-sea-salt.jpg` is a crop of the pitch-deck render, not studio
photography). Confirm final logo files (SVG) — current logo assets are cropped from a
supplied JPEG composite and are fine for web use but not print-ready.

Also note: the project folder contains a second, unused logo concept (a minimal
line-art puffin mark, presented as a "Primary Logo" brand sheet) alongside the
illustrated/gradient puffin actually used across the site today. Nobody has confirmed
which is final — if SIF wants to switch, expect to regenerate the favicon set and swap
every header/footer/OG logo reference in one pass, not just drop in the new file.

## UI/UX polish pass
Beyond the Phase 1 build, the following were added purely with CSS/vanilla JS (no new
dependencies, no build step):
- Scroll-reveal on cards, section headers and product tiles (`main.js` → `initScrollReveal`,
  respects `prefers-reduced-motion`)
- A sticky-header shadow on scroll, a "back to top" button, and an infinite trust-badge
  marquee under the home hero
- A soft animated gradient blob + gently floating product shot in the hero, plus a
  floating "100% baked, not fried" callout card
- Icon pop-in and lift/zoom hover states on feature cards and product cards
- The Home hero now uses `packshot-sea-salt.jpg` (a tight crop of the product can) instead
  of the full pitch-deck slide, which previously duplicated the header logo/tagline and
  left a large blank gap under the artwork
- The Our Story "founders" section is now a real, responsive team grid (cropped headshots
  + name/role/bio markup) instead of one flattened image of the whole deck slide — fixes
  accessibility/SEO and makes it legible on mobile
