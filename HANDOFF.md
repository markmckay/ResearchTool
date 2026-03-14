# ResearchTool Handoff

## Current state

- Repo: `https://github.com/markmckay/ResearchTool`
- Branch: `main`
- Active app: `code/literatureSearch`
- Codex run button builds and runs via `scripts/codex-run.sh`
- Local app URL during active work: `http://localhost:3000`
- Latest verified pushed commit: `c88b805` - `Add faster workspace triage controls`

## What landed in this run

- Cleaned up and stabilized the app baseline on `main`.
- Added a reusable quality-control stack:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test:unit:coverage`
  - `npm run qc`
  - `npm run qc:full`
  - GitHub Actions workflow in `.github/workflows/quality.yml`
- Added optional deployment auth:
  - login/logout routes
  - middleware-gated app/API access when shared credentials are configured
  - login page
  - auth e2e coverage
- Switched summarization configuration to OpenRouter:
  - `OPENROUTER_API_KEY`
  - `OPENROUTER_MODEL`
  - optional `RELEVANCE_MODEL` is not implemented yet
- Strengthened test coverage substantially:
  - auth helpers/routes
  - summarize route
  - home page orchestration
  - speech hook
  - workspace migration/persistence
  - workspace panel behavior
- Added root-level product strategy docs under `documents/`.
- Improved workspace triage flow:
  - quick result actions for `Priority`, `Maybe`, and `Exclude`
  - exclusion reason field on excluded papers
  - smart workspace views: `All saved`, `Needs reading`, `Priority + untagged`

## Verification status

Latest clean checks for the current checkpoint:

```bash
cd code/literatureSearch
npm run test:unit
npm run build
```

These passed for commit `c88b805` before it was pushed to `origin/main`.

Additional checks that were also run successfully in this overall workstream:

```bash
cd code/literatureSearch
npm run lint
npm run typecheck
npm run test:unit:coverage
npm run test:e2e
npm run qc:full
```

## Current repo hygiene

- `main` is clean and pushed.
- No known dirty app worktree remains from this session.
- Root `documents/` is now tracked intentionally.

## Important repo rules

- Do not go outside `/Users/mark/Dev/ResearchTool` unless explicitly approved.
- Keep UI changes narrow and preserve the current look unless the task requires changing it.
- Every verified batch should end with:
  - `npm run test:unit`
  - `npm run build`
  - commit with a clear message
  - push to `origin/main`

## Product state summary

The app now has:

- compact and card result layouts
- improved speech controls
- query-aware ranking in search results
- optional OpenRouter summarization
- optional shared-login protection for hosted/private deployments
- a local research workspace model with:
  - statuses: `Inbox`, `Maybe`, `Priority`, `Read`, `Excluded`
  - tags
  - notes
  - exclusion reasons
  - smart views
  - export support

## Recommended next feature batch

Build AI-assisted relevance scoring for search results.

Why this next:

- it directly improves search quality for the user’s dissertation workflow
- it complements the existing OpenRouter integration
- it fits the current local-first product direction
- the app core now has enough coverage to support a faster feature batch safely

## Files most likely to matter next

- `code/literatureSearch/app/api/summarize/route.ts`
- `code/literatureSearch/app/page.tsx`
- `code/literatureSearch/components/PaperCard.tsx`
- `code/literatureSearch/components/CompactPaperRow.tsx`
- `code/literatureSearch/components/PaperResultShared.tsx`
- `code/literatureSearch/.env.example`
- `code/literatureSearch/tests/unit/HomePage.test.tsx`

## Saved next-session prompt

Use:

- `NEXT_THREAD_PROMPT.md`
- `documents/relevance-scoring-session-prompt.md`
