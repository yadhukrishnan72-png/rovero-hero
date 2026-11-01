# Handoff

**Last updated:** 2026-11-01

## Where we are
Hero page (`index.html`, `hero.css`, `hero.js`) is live on the private repo
https://github.com/yadhukrishnan72-png/rovero-hero (branch `main`).
New: Indonesia country page (`country.html`, `country.css`, `country.js`, `images/indonesia.webp`),
deployed to a Vercel **preview** only (behind Deployment Protection, not production).

## What we did
Designed the country page: photo + info dropdowns, networks row, plan picker + order card, 4-step "how it works",
price-comparison bars, "why rovero" section, FAQ. Mobile checked at 390px. `.vercelignore` now excludes the
design-reference screenshots.

## What's next
1. **Replace placeholder data before production:** `PLANS` (only 1 GB / 7 days / $3.99 is real) and
   `COMPETITORS` + `CHECKED_ON` (competitor prices are invented) at the top of `country.js`.
2. Reconcile copy: key-features text says "1 GB for 7 days at $1.40" and "$1.40 to $16.40"; plan list says $3.99.
3. Decide where the page lives (`getrovero.com/destinations/id` vs `/country.html` on this Vercel project).
4. Make the page generic per country if wanted (currently hardcoded to Indonesia).

## Open questions
- Should Vercel be linked to the GitHub repo for auto-deploys?
- Nav/footer link paths in `country.html` are guesses; confirm against the real site.

## Cleanup
- Untracked design references left in the folder (not committed): `Country_Page*.png`, `Why coose rovero.png`,
  `Indonesia image.webp`, `Indonesia New Image.avif`.
