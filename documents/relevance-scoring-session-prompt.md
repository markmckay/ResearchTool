# Codex Implementation Prompt — Relevance Scoring Feature

## Context

Active app: `/Users/mark/Dev/ResearchTool/code/literatureSearch`

This is a Next.js + TypeScript + Tailwind academic literature search app for a PhD researcher with low vision. It already supports:

- search across Semantic Scholar, OpenAlex, arXiv, IEEE
- OpenRouter-based summarization
- compact and card result layouts
- a local research workspace model
- audio-first interaction and screen-reader-friendly behavior

Relevant files:

- `/Users/mark/Dev/ResearchTool/code/literatureSearch/app/api/search/route.ts`
- `/Users/mark/Dev/ResearchTool/code/literatureSearch/app/api/summarize/route.ts`
- `/Users/mark/Dev/ResearchTool/code/literatureSearch/app/page.tsx`
- `/Users/mark/Dev/ResearchTool/code/literatureSearch/components/PaperCard.tsx`
- `/Users/mark/Dev/ResearchTool/code/literatureSearch/components/CompactPaperRow.tsx`
- `/Users/mark/Dev/ResearchTool/code/literatureSearch/components/PaperResultShared.tsx`
- `/Users/mark/Dev/ResearchTool/code/literatureSearch/.env.example`

## Build

### 1. Add `/app/api/relevance/route.ts`

Create a POST endpoint that accepts:

```ts
{ papers: PaperInput[] }
```

Where each paper includes:

- `id`
- `title`
- `abstract?`
- `authors?`
- `year?`

Behavior:

- use `OPENROUTER_API_KEY`
- use `RELEVANCE_MODEL` if set, otherwise `OPENROUTER_MODEL`
- score papers in parallel
- for each paper, request JSON:

```json
{"score": 1-5, "reason": "one sentence"}
```

- use `max_tokens: 100`
- if abstract is missing or under 30 chars: return `score: 0`, `reason: "No abstract available"` without calling OpenRouter
- strip markdown fences before JSON parsing
- if any one paper fails: return `score: 0`, `reason: "Could not score"` for that paper
- never fail the whole batch because one paper fails
- return:

```ts
{ papers: ScoredPaper[] }
```

sorted by descending score

If OpenRouter config is missing, return:

```ts
{ notConfigured: true, papers: [] }
```

Use this exact research context in the prompt:

Research question: How can audio-first, AI-mediated academic writing workflows be designed to reduce cognitive load while preserving authorial control for people with low vision?

Key constructs:

- Authorial control: the degree to which a writer retains intentional agency over content, structure, and argument direction when delegating sub-tasks to AI
- Low vision: visual impairment not correctable with standard eyewear, affecting acuity, contrast, or visual field
- Cognitive load: mental effort imposed by the interaction design of a writing tool
- Audio-first interaction: systems designed primarily for speech input and text-to-speech output
- AI-mediated writing: using AI assistance for sub-tasks while the human retains authorial control

Relevant domains: HCI, assistive technology, accessible writing tools, speech interfaces, academic writing support, disability and higher education.

Scoring guide:

- 5 = Directly addresses the research question or a key construct
- 4 = Closely related, likely useful for background or methods
- 3 = Tangentially related, worth skimming
- 2 = Peripheral, probably not worth reading
- 1 = Not relevant

### 2. Update `/app/page.tsx`

After initial search results render, fire a non-blocking POST to `/api/relevance`.

Requirements:

- initial search results must appear immediately
- show a subtle live-region message while scoring: `Ranking by relevance…`
- announce completion in an `aria-live="polite"` region
- re-sort displayed results by relevance descending after scores return
- if `notConfigured: true`, silently skip
- protect against stale responses so older relevance requests cannot overwrite newer searches

### 3. Update result UI

Add optional props:

- `relevanceScore?: number`
- `relevanceReason?: string`

Show relevance in both result layouts, preferably through shared result UI so compact and card views stay aligned.

Requirements:

- score badge appears before the title in reading order
- display `Relevance: X/5`
- show one-line reason under it
- colors:
  - 5-4 green
  - 3 amber
  - 2-1 grey
- never rely on color alone
- score `0` means show nothing

### 4. Update env template

Add to:

- `/Users/mark/Dev/ResearchTool/code/literatureSearch/.env.example`

```env
# Optional: set a fast/cheap model specifically for relevance scoring. Falls back to OPENROUTER_MODEL if not set.
RELEVANCE_MODEL=google/gemini-flash-1.5
```

## Constraints

- server-side API calls only
- do not modify `/app/api/search/route.ts`
- do not modify deduplication logic
- follow existing summarize-route conventions
- keep UI keyboard accessible and screen-reader friendly
- keep changes tightly scoped

## Verification

Run:

```bash
cd /Users/mark/Dev/ResearchTool/code/literatureSearch
npm run test:unit
npm run build
```

If you add or update tests for this feature, keep them focused.
