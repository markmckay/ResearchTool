import type { Paper } from "@/types/paper";

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "for",
  "in",
  "of",
  "on",
  "or",
  "the",
  "to",
  "with",
]);

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function extractQueryTerms(query: string) {
  return normalizeText(query)
    .split(" ")
    .filter((term) => term.length > 2 && !STOP_WORDS.has(term));
}

function scorePaper(paper: Paper, query: string) {
  const normalizedQuery = normalizeText(query);
  const queryTerms = extractQueryTerms(query);
  const title = normalizeText(paper.title);
  const abstract = normalizeText(paper.abstract || "");
  const venue = normalizeText(paper.venue || "");
  const authors = normalizeText(paper.authors || "");

  let score = 0;

  if (normalizedQuery && title.includes(normalizedQuery)) {
    score += 120;
  }

  for (const term of queryTerms) {
    if (title.includes(term)) score += 28;
    if (abstract.includes(term)) score += 9;
    if (venue.includes(term)) score += 5;
    if (authors.includes(term)) score += 3;
  }

  const matchedTerms = queryTerms.filter((term) => title.includes(term) || abstract.includes(term)).length;
  score += matchedTerms * matchedTerms * 4;

  if (!paper.abstract || paper.abstract === "No abstract available.") {
    score -= 8;
  }

  score += Math.log10((paper.citations ?? 0) + 1) * 6;

  return score;
}

export function deduplicateAndRank(papers: Paper[], query: string): Paper[] {
  const seen = new Set<string>();
  return papers
    .filter((p) => {
      const key = p.title.toLowerCase().replace(/\s+/g, " ").trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => {
      const scoreDelta = scorePaper(b, query) - scorePaper(a, query);
      if (scoreDelta !== 0) return scoreDelta;
      return (b.citations ?? 0) - (a.citations ?? 0);
    });
}
