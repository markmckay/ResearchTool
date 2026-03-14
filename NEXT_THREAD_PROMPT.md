# Next Thread Prompt

Resume work on `/Users/mark/Dev/ResearchTool` for the active app in `code/literatureSearch`.

Start by reading:

- `AGENTS.md`
- `HANDOFF.md`
- `documents/relevance-scoring-session-prompt.md`

Current known good checkpoint:

- Branch: `main`
- Latest pushed verified commit: `c88b805` - `Add faster workspace triage controls`

Important working agreement:

- Every verified feature or cleanup batch ends with:
  - `npm run test:unit`
  - `npm run build`
  - a clean commit with a clear message
  - push to `origin/main`
- Keep commits narrowly scoped so `main` remains a trustworthy rollback point.
- Do not blindly commit unrelated or generated files.

Current product state:

- The app now has:
  - compact and card result layouts
  - query-aware ranking from the search route
  - OpenRouter summarization
  - optional shared-login protection for hosted/private deployments
  - a local research workspace model with:
    - statuses: `Inbox`, `Maybe`, `Priority`, `Read`, `Excluded`
    - tags
    - notes
    - exclusion reasons
    - smart views
    - quick triage actions from results

Current repo state:

- `main` is clean.
- Quality control is now built in:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test:unit:coverage`
  - `npm run qc`
  - `npm run qc:full`
- CI exists in `.github/workflows/quality.yml`.

What to do next:

1. Implement the relevance-scoring feature described in `documents/relevance-scoring-session-prompt.md`.
2. Keep changes tightly scoped to that feature.
3. Add focused tests where they are most valuable.
4. Verify with:

```bash
cd code/literatureSearch
npm run test:unit
npm run build
```

5. Commit and push the feature batch to `origin/main`.

Implementation guidance:

- The prompt in `documents/relevance-scoring-session-prompt.md` has already been tightened to fit this repo.
- Make sure relevance UI works for both compact and card result layouts.
- Protect against stale relevance responses overwriting newer searches.
- If the relevance route is not configured, skip gracefully without a user-facing error.

Product context:

- This is primarily a bespoke PhD research tool for the user.
- Accessibility and low-friction research workflow matter more than generic enterprise complexity.
- Backend persistence is still intentionally deferred until the workflow stabilizes.

Tone/context:

- Move confidently.
- Favor practical, shippable feature work.
- Keep the batch cohesive and verify it before pushing.
