import type { Paper } from "@/types/paper";

export async function searchIEEE(
  query: string,
  limit = 8
): Promise<Paper[]> {
  const apiKey = process.env.IEEE_API_KEY;

  // Silently skip if no key configured — not an error
  if (!apiKey) return [];

  const url = `https://ieeexploreapi.ieee.org/api/v1/search/articles?querytext=${encodeURIComponent(query)}&max_records=${limit}&apikey=${apiKey}`;

  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error("IEEE Xplore request failed");

  const data = await res.json();

  return (data.articles || []).map((a: any): Paper => ({
    id: a.article_number ?? Math.random().toString(),
    title: a.title || "Untitled",
    authors: (a.authors?.authors || [])
      .slice(0, 3)
      .map((au: any) => au.full_name)
      .filter(Boolean)
      .join(", "),
    year: a.publication_year ? parseInt(a.publication_year) : null,
    abstract: a.abstract || "No abstract available.",
    citations: a.citing_paper_count ?? 0,
    venue: a.publication_title || "",
    source: "IEEE" as any,
    pdfUrl: a.pdf_url ?? null,
    doi: a.doi ?? null,
  }));
}
