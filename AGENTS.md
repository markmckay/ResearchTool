# AGENTS.md

Keep this repo lightweight. Prefer direct, narrow changes over process-heavy coordination.

## Scope

- The active app lives in `code/literatureSearch`.
- Treat the repository root as a wrapper directory for the app, helper scripts, and archives.
- Ignore `archive/` unless the user explicitly asks for it.
- Do not go outside `/Users/mark/Dev/ResearchTool` unless the user explicitly approves it for that task.

## Working style

- Default workflow: inspect the relevant code, make the requested change, and verify it.
- Do not add planning or process documents unless the user asks for them.
- Keep edits tightly scoped to the request. Avoid opportunistic refactors.
- Preserve the existing UI and code style unless the task requires changing them.

## Commands

Run app commands from `code/literatureSearch`.

```bash
npm run dev
npm run lint
npm run test:unit
npm run test:e2e
npm run build
```

From the repo root, `scripts/codex-run.sh` can be used to start the dev server.

## Verification

- For small changes, run the narrowest useful check.
- For behavior changes, prefer the most relevant test over running everything by default.
- If you could not run verification, say so clearly.
