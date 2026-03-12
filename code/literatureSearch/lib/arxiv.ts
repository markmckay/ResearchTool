import type { Paper } from "@/types/paper";

function parseArxivEntry(entry: Element): Paper {
  const getText = (tag: string) =>
    entry.getElementsByTagName(tag)[0]?.textContent?.trim() ?? "";

  const id = getText("id");
  const title = getText("title").replace(/\s+/g, " ");
  const abstract = getText("summary").replace(/\s+/g, " ");
  const published = getText("published");
  const year = published ? parseInt(published.slice(0, 4)) : null;

  const authors = Array.from(entry.getElementsByTagName("author"))
    .slice(0, 3)
    .map((a) => a.getElementsByTagName("name")[0]?.textContent?.trim() ?? "")
    .filter(Boolean)
    .join(", ");

  // Find PDF link
  const links = Array.from(entry.getElementsByTagName("link"));
  const pdfLink = links.find((l) => l.getAttribute("type") === "application/pdf");
  const pdfUrl = pdfLink?.getAttribute("href") ?? null;

  // arXiv ID for DOI-style link
  const arxivId = id.split("/abs/")[1] ?? null;

  return {
    id: id || Math.random().toString(),
    title,
    authors,
    year,
    abstract: abstract || "No abstract available.",
    citations: 0, // arXiv API doesn't provide citation counts
    venue: "arXiv",
    source: "arXiv" as any,
    pdfUrl: pdfUrl ?? (arxivId ? `https://arxiv.org/pdf/${arxivId}` : null),
    doi: arxivId ? `arxiv:${arxivId}` : null,
  };
}

export async function searchArxiv(
  query: string,
  limit = 8
): Promise<Paper[]> {
  // Map common terms to arXiv-friendly search
  const url = `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=${limit}&sortBy=relevance&sortOrder=descending`;

  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error("arXiv request failed");

  const text = await res.text();

  // Parse XML in Node environment
  const { DOMParser } = await import("@xmldom/xmldom");
  const parser = new DOMParser();
  const xml = parser.parseFromString(text, "text/xml");
  const entries = Array.from(xml.getElementsByTagName("entry"));

  return entries.map(parseArxivEntry);
}
