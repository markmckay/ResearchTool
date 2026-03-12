# ResearchTool Handoff

## Current state

- Repo: `https://github.com/markmckay/ResearchTool`
- Branch: `main`
- Codex run button builds and runs the app via `scripts/codex-run.sh`
- Active app: `code/literatureSearch`

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
  - added `Jump to first title`
- Improved speech behavior:
  - top-5 reader is now a toggle
  - title preview is a toggle
  - abstract reading is a toggle
  - fallback global stop control still exists
- Added favicon support.
- Added automated coverage:
  - unit tests with Vitest
  - end-to-end tests with Playwright

## Verification status

Last known clean checks:

```bash
cd code/literatureSearch
npm run test:unit
npm run test:e2e
npm run build
```

These passed before the last push cycle.

## Important repo rules

- Do not go outside `/Users/mark/Dev/ResearchTool` unless the user explicitly approves it for that task.
- Keep UI changes narrow; preserve the existing look unless the user asks for visual changes.

## Likely follow-up items

- Do a fresh UX pass on the live app and confirm the speech toggles feel right in real use.
- Check whether any in-page speech labels or wording should be simplified further.
- If desired, add one more Playwright test for stopping a speaking control after it has started.
- If desired, clean up any remaining runtime rough edges around Next local start behavior.

## Files most likely to matter next

- `code/literatureSearch/app/page.tsx`
- `code/literatureSearch/components/SearchBar.tsx`
- `code/literatureSearch/components/PaperCard.tsx`
- `code/literatureSearch/hooks/useSpeech.ts`
- `code/literatureSearch/tests/e2e/search-flow.spec.ts`
- `scripts/codex-run.sh`

## Suggested next-thread goal

Open the app, do a focused QA pass on the speech controls and search-result navigation, and make only narrow UX fixes if something still feels off.
