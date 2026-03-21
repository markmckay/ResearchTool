export interface Paper {
  id: string;
  title: string;
  authors: string;
  year: number | null;
  abstract: string;
  relevanceScore?: number;
  relevanceReason?: string;
  citations: number;
  venue: string;
  source: "Semantic Scholar" | "OpenAlex" | "arXiv" | "IEEE";
  pdfUrl: string | null;
  doi: string | null;
}

export interface PaperSummary {
  overview: string;
  keyFindings: string;
  keyFindingsSource: "pdf" | "abstract" | "unavailable";
  pdfExtractionStatus?: "not_attempted" | "success" | "failed";
}
