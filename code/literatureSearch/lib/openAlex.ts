import type { Paper } from "@/types/paper";

function reconstructAbstract(
  invertedIndex: Record<string, number[]> | null
): string {
  if (!invertedIndex) return "No abstract available.";
  const words: Record<number, string> = {};
  for (const [word, positions] of Object.entries(invertedIndex)) {
    for (const pos of positions) words[pos] = word;
  }
  return Object.keys(words)
    .sort((a, b) => Number(a) - Number(b))
    .map((k) => words[Number(k)])
    .join(" ");
}

export async function searchOpenAlex(
  query: string,
  limit = 10
): Promise<Paper[]> {
  const select =
    "id,title,authorships,publication_year,abstract_inverted_index,cited_by_count,primary_location,open_access,doi";
  const url = `https://api.openalex.org/works?search=${encodeURIComponent(query)}&per-page=${limit}&select=${select}`;

  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error("OpenAlex request failed");

  const data = await res.json();
  return (data.results || []).map((p: any): Paper => ({
    id: p.id ?? Math.random().toString(),
    title: p.title || "Untitled",
    authors: (p.authorships || [])
      .slice(0, 3)
      .map((a: any) => a.author?.display_name)
      .filter(Boolean)
      .join(", "),
    year: p.publication_year ?? null,
    abstract: reconstructAbstract(p.abstract_inverted_index),
    citations: p.cited_by_count ?? 0,
    venue: p.primary_location?.source?.display_name || "",
    source: "OpenAlex",
    pdfUrl: p.open_access?.oa_url ?? null,
    doi: p.doi ? p.doi.replace("https://doi.org/", "") : null,
  }));
}
