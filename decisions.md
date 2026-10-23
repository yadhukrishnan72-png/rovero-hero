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
