# Rovero eSIM pages
Read `handoff.md` first, every session.

Static pages, no build step. Deployed on Vercel (project `rovero-hero`, public, `npx vercel deploy --prod --yes`); repo: github.com/yadhukrishnan72-png/rovero-hero (private, `main`).

## Layout
- `index.html`, `hero.css`, `hero.js`, `images/`: hero page.
- `country-page/`: Indonesia page (`country.*`) plus sample pages `japan.html`, `netherlands.html`.
- `region-page/`: `europe.html` is live; `region.html` (Africa) is placeholder and kept off the site.
- `destination-art/scenes/`: 246 static scene SVGs named by code (`id.svg`, `af-21.svg`); `destination-art/scene-plan.xlsx` is the source list. `tools/` holds the generators (`build_all_scenes.py`, `scene_data.py` = motifs per code).
- `rovero-handoff/`: developer copy (data-driven template + data + assets + docs). It is also its own private repo: github.com/yadhukrishnan72-png/rovero-handoff. Edit here, then sync to a clone of that repo.

## Rules
- Never commit `.env*`, `.vercel/`, `Reference Image.png`, the supplier plan file `destination-art/esim-plans-*.xlsx` (wholesale prices), `eSIMtech_products_*.pdf`, `research/`, or `country-page/reference/` and `ICON Reference.png` (design/competitor references). All are in `.gitignore`/`.vercelignore`.
- Git/GitHub root is this `Rovero/` folder only. The parent `Documents/` is not a repo; don't touch sibling folders.
- Ask the user before creating repos, pushing, or deploying to production. Deploy only when asked (an unrequested deploy was blocked).
- Do not name competitors on pages. Do not publish invented carrier names, prices or country lists as real: plans, prices, voice bundles, networks and Africa's country list are placeholders.
- Sensitive places (Israel, Taiwan, Kosovo, Armenia...) get neutral scenes: no flags or contested symbols; no map border lines.
- Brand: #6415FE, Plus Jakarta Sans, #F7F7F7 canvas; tokens at the top of `hero.css` and `rovero-handoff/pages/destination.css`.

## Working notes (Windows)
- Check visuals with headless Chrome screenshots. Headless won't render narrower than ~500px, so test 390px by loading the page in a 390px-wide iframe wrapper.
- Long python/shell snippets with quotes break in Git Bash heredocs: write a script file instead. Pass `MSYS_NO_PATHCONV=1` when giving `/path` args to `vercel curl`.
- After a Vercel deploy a URL can return 404 for a few seconds; re-check before assuming it failed.
