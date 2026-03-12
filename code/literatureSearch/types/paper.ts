export interface Paper {
  id: string;
  title: string;
  authors: string;
  year: number | null;
  abstract: string;
  citations: number;
  venue: string;
  source: "Semantic Scholar" | "OpenAlex" | "arXiv" | "IEEE";
  pdfUrl: string | null;
  doi: string | null;
}
