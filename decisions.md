# Decisions

## 2026-10-23: Repo name `rovero-hero`, private
- Why: matches the existing Vercel project name; user approved.
- Not picked: `rovero` (less specific to the hero page).

## 2026-10-23: Exclude `Reference Image.png` from the repo
- Why: 729 KB design reference, already in `.vercelignore`, not a deploy asset. User chose to leave it out.
- Not picked: committing it for versioned design reference.

## 2026-10-23: Repo root is `Rovero/`, not `Documents/`
- Why: Documents holds unrelated projects (some with secrets); a repo there would risk committing them.
- Not picked: init in Documents.

## 2026-10-23: Ignore `.vercel/`
- Why: holds Vercel project/org IDs (deployment config, not secrets) that don't belong in source control.

## 2026-11-10: Plan picker = square tiles, 3 per row, with a compact order summary
- Why: owner wanted square tiles (inspired by the reference, not a copy); tiles keep working for any number of plans and for voice/unlimited bundles. Desktop buying column capped at 36rem so tiles stay about 183px; the order card is one summary line + Pay now because the Data/Validity/Speed rows repeated what the tile shows.
- Not picked: list rows (old design); 2 per row on phones; taller non-square tiles; a full-width desktop grid (tiles looked oversized).

## 2026-11-10: Replace the competitor price comparison with "Which traveller are you?"
- Why: the owner does not want to name competitors; the persona cards are static, so they don't depend on the plan list (voice bundles, 500 GB plans).
- Not picked: a usage calculator tied to the selected plan (complex with voice/500 GB); "Will it work on my phone?"; "Stay connected where you're going"; "rovero vs roaming" (needs sourced figures).

## 2026-11-10: Local plan = gold lightning badge driven by a `local: true` plan flag
- Why: which plans are local differs per country, so it must come from data, not sizes. Corner badge (top-left, mirroring the selection check) plus a "Local plan" notice on tabs that have one; icon redrawn as SVG from the owner's reference (cream tile #FFF4D9, bolt #F0B100).
- Not picked: inline bolt next to the size; purple or dark-bolt badges; hardcoding 5/10 GB.

## 2026-11-10: Regional plans carry their own country list; "N countries ›" opens a sheet
- Why: each regional package can cover different countries. A link in the tile opens a bottom sheet (dialog on desktop) with search and "Choose this plan"; opening it does not change the selection. The coverage card and the page-level "Countries included" section were removed on request.
- Not picked: an expanding list inside the page; a corner globe icon; a page-level section that follows the selection.

## 2026-11-11: Destination art = static flat scenes for all 246 destinations (no animation)
- Why: owner preferred the scene style over map outlines; it needs no licensing. 14 base scenes x 3 moods + a motif library, with a landmark per destination from the approved `scene-plan.xlsx`. Sensitive places are neutral (no flags, no map borders).
- Not picked: map-outline art (accurate but less appealing); real photos via the Unsplash API (application pending, quality uneven, API terms require hotlinking and credits); stock photos; animated art.

## 2026-11-11: Developer handoff = new private repo `rovero-handoff` with one data-driven template
- Why: the developer only needs the template, data format, assets and docs, not the internal notes in `rovero-hero`; one `destination.html` + data files replaces per-country page copies (about 250 pages). Step illustrations and icons are inline HTML/SVG, so no separate image files are needed.
- Not picked: adding the folder to `rovero-hero` (exposes internal notes); a zip only; leaving separate country/region page copies.

## 2026-11-11: Only publish what was asked; Africa page and handoff stay off the live site
- Why: the Vercel site is public and the Africa page has invented country names. Japan, Netherlands and Europe samples were deployed on request; `.vercelignore` keeps `region-page/region.*`, `africa.svg`, `rovero-handoff/`, `tools/` and the art previews off the site. Wholesale price files are never deployed or committed.

## 2026-11-11: eSIM Access plan rules for the page data
- Why (owner): import only 1 GB (7 days), 3 GB (15), 5/10/20/50 GB (30) and the "Unlimited 2 GB/day" plan; the 100 MB (7 days) plan sits under a "More plans" link (`more: true`); if two plans share GB, validity and price, keep the local one (roaming vs local). 1 GB validity was assumed to be 7 days.
- Not picked: showing every supplier plan; showing 100 MB in the main grid.

## 2026-11-17: Data + Voice plans are split by coverage (Only / + Asia / + Global), local first
- Why (owner): customers confused local plans with regional/global ones. Names "Indonesia Only" / "Indonesia + Asia" / "Indonesia + Global" state coverage; section order is local, Asia, global. Existing badges kept (lightning = local, globe = regional/global); only voice tab changed.
- Not picked: "Local" as the section name (the confusing word), "Inside / Beyond" names, a single mixed list.

## 2026-11-17: Truly unlimited plans get their own green infinity badge and note; local note follows the selected plan
- Why (owner): some Unlimited plans have no FUP. A plan can be both local and truly unlimited, so both badges show (side by side; bottom-left corner on phones to avoid covering text). The Local note follows the selected plan so it only appears when relevant.
- Not picked: one combined capsule badge; stacking the badges vertically on phones (covered the tile text).
