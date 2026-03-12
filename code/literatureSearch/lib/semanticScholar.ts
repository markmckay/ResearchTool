import type { Paper } from "@/types/paper";

export async function searchSemanticScholar(
  query: string,
  limit = 10
): Promise<Paper[]> {
  const fields =
    "title,authors,year,abstract,citationCount,externalIds,openAccessPdf,venue";
  const url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&limit=${limit}&fields=${fields}`;

  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error("Semantic Scholar request failed");

  const data = await res.json();
  return (data.data || []).map((p: any): Paper => ({
    id: p.paperId ?? Math.random().toString(),
    title: p.title || "Untitled",
    authors: (p.authors || []).map((a: any) => a.name).join(", "),
    year: p.year ?? null,
    abstract: p.abstract || "No abstract available.",
    citations: p.citationCount ?? 0,
    venue: p.venue || "",
    source: "Semantic Scholar",
    pdfUrl: p.openAccessPdf?.url ?? null,
    doi: p.externalIds?.DOI ?? null,
  }));
}
