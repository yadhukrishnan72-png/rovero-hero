# Handoff

**Last updated:** 2026-11-11

## Where we are
Rovero eSIM pages, all static (no build step), deployed on Vercel project `rovero-hero` (public) and versioned in the private repo
https://github.com/yadhukrishnan72-png/rovero-hero (`main`). Everything below was committed and pushed at the end of this session (`/handoff`).

- **Live on https://rovero-hero.vercel.app:** hero page; Indonesia `country-page/country.html`; samples `country-page/japan.html` and `netherlands.html` (scene art);
  `region-page/europe.html` (+ `region.css`, `europe.js`, `images/eu.svg`). Not on the site (via `.vercelignore`): Africa `region-page/region.html`, `rovero-handoff/`, `tools/`, art previews, `*.xlsx`.
- **Page design (all three page types):** square plan tiles (3 per row, always), tabs Data / Data + Voice / Unlimited, compact order summary, "Which traveller are you?", gold lightning badge for local plans (`local: true`),
  Unlimited notice. Regions: each plan has its own country list; tile link "N countries ›" opens a sheet; plans flagged `more: true` hide behind a "More plans" link (100 MB).
- **Destination art:** 246 static scene SVGs in `destination-art/scenes/` (203 countries + 43 region groups, named by code), generated from `destination-art/scene-plan.xlsx` by `tools/build_all_scenes.py`
  (`scene_data.py` = motifs per code, `scene_kit.py` = 125 motifs, `scene_backdrops.py` = 14 base scenes x 3 moods). Owner approved the look; weak scenes listed below.
- **Developer handoff:** `rovero-handoff/` is also its own private repo https://github.com/yadhukrishnan72-png/rovero-handoff (3 commits; one data-driven `pages/destination.html` + data + 246 scenes + README/design tokens/generator).
  The owner invites the developer (Settings > Collaborators, Read). To update it: change `rovero-handoff/` here, re-sync to a clone of that repo, ask before pushing.

## What we did (this session)
Redesigned the plan UI, added voice/unlimited/local plans, built region pages, produced all destination art, wrote the handoff package and repo, deployed the Japan/Netherlands/Europe samples,
and drafted developer messages (plan types, local icon, regional coverage, networks from API, eSIM Access plan list) plus the discount-code requirement and an affiliate reply. Detail in `sessions/2026-11-11.md`; reasons in `decisions.md`.

## What's next
1. **Owner decisions for the eSIMCompare discount code** (nothing built yet): discount %, which plans, day passes, returning customers, expiry, stacking. Then: send the developer message, reply to the affiliate
   (draft exists in the chat history, not in files), and optionally add the price display (crossed-out price, "code applied", read `?code=`) to the template and the handoff repo.
2. **Replace placeholder data** (developer): plans/prices/voice bundles, networks (from the API: operator + 4G/5G), Africa's country list, nav/footer/related links; wire `rovero:pay` to checkout.
   Plan rules from eSIM Access: 1 GB (7d), 3 GB (15d), 5/10/20/50 GB (30d), "Unlimited 2 GB/day"; 100 MB (7d) under "More plans"; duplicates (same GB, validity, price) -> keep the local plan.
3. Wire the scene SVGs into the real site (set the hero `<img src>` to the code's SVG); decide where pages live (`getrovero.com/destinations/<code>` vs this Vercel project).
4. Optional polish on weak scenes: Saudi Arabia (plain block), Nepal/South Asia (stupa), Peru, Bosnia (Mostar), DR Congo (okapi), baobab cones (Senegal/Madagascar), overlapping landmarks in Australia & NZ / Australia, UK & USA, similar volcano scenes.
5. The Unsplash API application is pending; only needed if the owner later wants real photos.

## Open questions for the owner
- 1 GB validity (assumed 7 days) and the Unlimited throttle unit ("1 MB/s": 1 MB/s or 1 Mbps?).
- Is the "Local plan ... faster speeds" claim accurate for every local plan?
- Is the Vercel Git integration for `rovero-hero` connected (Settings > Git)? Unconfirmed.
- Usage rights of the photos `country-page/images/{indonesia.webp,france.jpg,japan.jpg,thailand.jpg}` (live site) are unconfirmed; they are not in the handoff repo.
- Brunei, Brazil, Mali, Niger, Uzbekistan, Vatican scenes use religious landmarks (marked "confirm" in `scene-plan.xlsx`).

## Cleanup / things to know
- Never committed (in `.gitignore`/`.vercelignore`): `.env*`, `.vercel/`, `Reference Image.png`, `destination-art/esim-plans-*.xlsx` (supplier **wholesale prices**), `eSIMtech_products_*.pdf`, `research/`,
  `country-page/reference/` and `country-page/ICON Reference.png` (design/competitor references), `destination-art/pilot/` and `samples/` (regenerable previews), `__pycache__/`.
- The Vercel site is public. Only publish what was asked; deploy with `npx vercel deploy --prod --yes` only on request.
- Natural Earth map data (for the unused map style) is not stored; download `ne_50m_admin_0_countries.geojson` if `tools/destination_art.py` map mode is needed again.
