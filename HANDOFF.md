# ResearchTool Handoff

## Current state

- Repo: `https://github.com/markmckay/ResearchTool`
- Branch: `main`
- Codex run button builds and runs the app via `scripts/codex-run.sh`
- Active app: `code/literatureSearch`
- Latest verified pushed commit: `edad3af` - `Add research workspace triage and compact results`
- Local app URL during active work: `http://localhost:3000`

## Completed

- Fixed stale/invalid dependencies so the Next app installs and builds cleanly.
- Added a working Codex run action in `.codex/environments/environment.toml`.
- Created the GitHub repo and pushed `main`.
- Fixed the broken local run behavior caused by stale Next dev state.
- Improved search accessibility flow without redesigning the UI:
  - removed forced post-search focus jump / bad auto-scroll
  - quick-search chips now fill the search box without auto-submitting
  - titles are the primary interactive target
  - lightweight speech affordance added beside each title
  - results are structured as an ordered list
- Improved speech behavior:
  - top-5 reader is now a toggle
  - title preview is a toggle
  - abstract reading is a toggle
  - fallback global stop control still exists
- Added a denser results workflow:
  - compact and card result layouts
  - cleaner top toolbar with fewer non-essential controls
  - removed `Jump to first title` after live UX review for the user's workflow
- Added a local research workspace model on top of saved papers:
  - workspace statuses: `Inbox`, `Maybe`, `Priority`, `Read`, `Excluded`
  - freeform tags with deduplication
  - per-paper notes
  - workspace filtering by status and tags
  - migrated older saved-paper localStorage entries forward into the workspace model
  - export now includes workspace metadata where available
- Added favicon support.
- Added automated coverage:
  - unit tests with Vitest
  - end-to-end tests with Playwright
- Established a working release cadence for this repo:
  - build a focused batch
  - run `npm run test:unit` and `npm run build`
  - commit immediately if green
  - push straight to `origin/main`

## Verification status

Last known clean checks:

```bash
cd code/literatureSearch
npm run test:unit
npm run build
```

These passed for commit `edad3af` before it was pushed to `origin/main`.

## Git hygiene status

- `main` has the verified workspace/UX batch pushed.
- There is still a dirty worktree with older unrelated changes and generated artifacts that were intentionally not included in the clean feature commit.
- A cleanup/code-health pass is the next intended batch before more substantial feature work.

## Important repo rules

- Do not go outside `/Users/mark/Dev/ResearchTool` unless the user explicitly approves it for that task.
- Keep UI changes narrow; preserve the existing look unless the user asks for visual changes.
- Standard working agreement going forward:
  - every verified batch ends with commit + push to `origin/main`
  - prefer lightweight governance: checks and clean rollback points without heavy process
  - use `main` as the user's trusted rollback point for the app

## Likely follow-up items

- Run a focused code-health review and cleanup pass on `code/literatureSearch`.
- Prioritize findings by severity, then implement the highest-value fixes immediately.
- Clean up the dirty worktree and generated artifacts in a separate, deliberate batch.
- Decide whether to add stronger standing checks such as a more reliable lint/static-analysis layer for the Next/TypeScript app.
- After cleanup, continue with phased product work:
  - source selector redesign for more literature providers
  - more literature sources in batches
  - later, persistent backend storage once the workflow stabilizes

## Files most likely to matter next

- `code/literatureSearch/app/page.tsx`
- `code/literatureSearch/components/BookmarkPanel.tsx`
- `code/literatureSearch/components/CompactPaperRow.tsx`
- `code/literatureSearch/hooks/useBookmarks.ts`
- `code/literatureSearch/lib/workspace.ts`
- `code/literatureSearch/lib/exportDocx.ts`
- `scripts/codex-run.sh`

## Suggested next-thread goal

Do a focused code-health review of `code/literatureSearch`, report findings first by severity, then implement the best cleanup fixes in a batch, verify with `npm run test:unit` and `npm run build`, and push another clean checkpoint to `origin/main`.
