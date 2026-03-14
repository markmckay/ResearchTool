# Research Literature Search

An accessible, audio-first academic paper search tool built with Next.js, shadcn/ui, and Tailwind CSS.

Searches **Semantic Scholar** and **OpenAlex** simultaneously, with an optional shared-login gate for private deployments.

---

## Features

- Search across two major open academic databases at once
- Results ranked by citation count
- **Read aloud** — every abstract and summary can be read via TTS
- **Bookmark** papers to a saved list
- **Export** saved papers to a Word document (.docx)
- **AI summarization** — plain language summaries (requires OpenRouter API key)
- Full keyboard navigation and screen reader support

---

## Setup

### 1. Install dependencies

You need Node.js installed. Download it at https://nodejs.org if you don't have it.

```bash
cd literature-search
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Open `.env.local` and add what you need:

```env
APP_LOGIN_USERNAME=your_username
APP_LOGIN_PASSWORD=your_password
AUTH_SESSION_SECRET=choose_a_long_random_secret
OPENROUTER_API_KEY=your_key_here
OPENROUTER_MODEL=anthropic/claude-sonnet-4.5
```

Get a key at https://openrouter.ai/ and choose the model you want to use.

The shared login is optional locally. Everything except AI summarization works without the OpenRouter settings.

### 3. Run locally

```bash
npm run dev
```

Open http://localhost:3000

---

## Quality Checks

Run these from `code/literatureSearch`:

```bash
npm run lint
npm run typecheck
npm run test:unit
npm run test:unit:coverage
npm run test:e2e
npm run qc
npm run qc:full
```

- `npm run qc` runs the fast local gate: lint, typecheck, and unit tests.
- `npm run qc:full` runs the full pass: `qc`, coverage, production build, and Playwright e2e.
- The auth e2e test is skipped unless shared-login environment variables are configured.

---

## Deploy to Vercel

1. Push this folder to a GitHub repository
2. Go to https://vercel.com and sign in with GitHub
3. Click "Add New Project" and import your repo
4. Add your environment variables in the Environment Variables section:
   - `APP_LOGIN_USERNAME`
   - `APP_LOGIN_PASSWORD`
   - `AUTH_SESSION_SECRET`
   - `OPENROUTER_API_KEY` if you want summaries enabled
   - `OPENROUTER_MODEL` for the summarization model
5. Click Deploy

For Git auto-deploys, the Vercel project must also have an active GitHub connection for the account/team that owns the project.

For intentional production deploys from this repo, run:

```bash
cd code/literatureSearch
npm run deploy:prod
```

That workflow runs `npm run test:unit`, `npm run build`, deploys to production, stamps the footer badge with the current Git commit SHA, and verifies the live production site shows that build ID.

---

## Project Structure

```
app/
  page.tsx              # Main search page
  layout.tsx            # Root layout
  api/
    search/route.ts     # Queries both APIs server-side
    summarize/route.ts  # AI summarization via OpenRouter
components/
  SearchBar.tsx         # Query input + quick searches
  PaperCard.tsx         # Individual result card
  BookmarkPanel.tsx     # Saved papers slide-out panel
  SummaryDialog.tsx     # AI summary popup
lib/
  semanticScholar.ts    # Semantic Scholar API client
  openAlex.ts           # OpenAlex API client
  deduplicate.ts        # Merge + dedup + rank logic
  exportDocx.ts         # Word document export
  utils.ts              # Tailwind class utility
hooks/
  useBookmarks.ts       # Bookmark state (localStorage)
  useSpeech.ts          # Text-to-speech hook
types/
  paper.ts              # Shared Paper type
```

---

## Adding features

This codebase is designed for agentic iteration with Claude Code or Cursor.

Some ideas for next steps:
- Add IEEE Xplore API (requires free API key from IEEE)
- Filter results by year range or venue
- Export to BibTeX format for reference managers
- Save search history
- Add arXiv search for preprints
