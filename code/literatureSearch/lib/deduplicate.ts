import type { Paper } from "@/types/paper";

export function deduplicateAndRank(papers: Paper[]): Paper[] {
  const seen = new Set<string>();
  return papers
    .filter((p) => {
      const key = p.title.toLowerCase().replace(/\s+/g, " ").trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => (b.citations ?? 0) - (a.citations ?? 0));
}
