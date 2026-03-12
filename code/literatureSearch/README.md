# Research Literature Search

An accessible, audio-first academic paper search tool built with Next.js, shadcn/ui, and Tailwind CSS.

Searches **Semantic Scholar** and **OpenAlex** simultaneously — both free, no login required.

---

## Features

- Search across two major open academic databases at once
- Results ranked by citation count
- **Read aloud** — every abstract and summary can be read via TTS
- **Bookmark** papers to a saved list
- **Export** saved papers to a Word document (.docx)
- **AI summarization** — plain language summaries (requires Anthropic API key)
- Full keyboard navigation and screen reader support

---

## Setup

### 1. Install dependencies

You need Node.js installed. Download it at https://nodejs.org if you don't have it.

```bash
cd literature-search
npm install
```

### 2. Configure environment (optional — for AI summarization)

```bash
cp .env.example .env.local
```

Open `.env.local` and add your Anthropic API key:
```
ANTHROPIC_API_KEY=your_key_here
```

Get a key at https://console.anthropic.com — free tier is sufficient.

Everything except AI summarization works without this key.

### 3. Run locally

```bash
npm run dev
```

Open http://localhost:3000

---

## Deploy to Vercel (free)

1. Push this folder to a GitHub repository
2. Go to https://vercel.com and sign in with GitHub
3. Click "Add New Project" and import your repo
4. Add your `ANTHROPIC_API_KEY` in the Environment Variables section
5. Click Deploy

Done. Vercel auto-deploys on every push to main.

---

## Project Structure

```
app/
  page.tsx              # Main search page
  layout.tsx            # Root layout
  api/
    search/route.ts     # Queries both APIs server-side
    summarize/route.ts  # AI summarization (needs API key)
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
