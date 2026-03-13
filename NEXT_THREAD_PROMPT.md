# Next Thread Prompt

Resume work on `/Users/mark/Dev/ResearchTool` for the active app in `code/literatureSearch`.

Start by reading:

- `AGENTS.md`
- `HANDOFF.md`

Current known good checkpoint:

- Branch: `main`
- Latest pushed verified commit: `edad3af` - `Add research workspace triage and compact results`

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
  - a refined toolbar with fewer non-essential controls
  - a local research workspace model built on saved papers
  - statuses: `Inbox`, `Maybe`, `Priority`, `Read`, `Excluded`
  - freeform tags
  - per-paper notes
  - workspace filtering by status and tags
- These changes are already committed and pushed in `edad3af`.

Current repo state:

- There is still a dirty worktree with unrelated older changes and generated artifacts not included in the clean feature commit.
- Treat cleanup as a separate batch.

What to do next:

1. Perform a focused code review / quality audit of `code/literatureSearch`.
2. Present findings first, ordered by severity, with file references.
3. Then start implementing the highest-value cleanup fixes immediately.
4. Verify with:

```bash
cd code/literatureSearch
npm run test:unit
npm run build
```

5. Commit and push the cleanup batch to `origin/main`.

What to prioritize in the review:

- TypeScript safety and data-model consistency
- React/Next best practices
- duplicated code or duplicated UI patterns
- fragile localStorage/workspace behavior
- missing tests around the new workspace model
- opportunities to add or strengthen lint/static-analysis checks without slowing velocity too much

Product context:

- This is primarily a bespoke PhD research tool for the user.
- Accessibility and low-friction research workflow matter more than generic enterprise complexity.
- We still expect more literature sources to be added later, and likely a source-selector redesign.
- Backend persistence is intentionally deferred until the workflow stabilizes.

Tone/context:

- Move confidently.
- Favor practical senior-engineer cleanup over process-heavy ceremony.
- Keep changes tightly scoped.
