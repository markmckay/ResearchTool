import { deduplicateAndRank } from "@/lib/deduplicate";
import type { Paper } from "@/types/paper";

const papers: Paper[] = [
  {
    id: "classic",
    title: "Support-Vector Networks",
    authors: "Corinna Cortes, Vladimir Vapnik",
    year: 1995,
    abstract: "No abstract available.",
    citations: 31915,
    venue: "Machine Learning",
    source: "OpenAlex",
    pdfUrl: null,
    doi: null,
  },
  {
    id: "match",
    title: "Authorial Control in AI Writing Tools",
    authors: "Jane Doe",
    year: 2024,
    abstract: "This paper studies authorial control and ownership in AI writing interfaces.",
    citations: 42,
    venue: "CHI",
    source: "Semantic Scholar",
    pdfUrl: null,
    doi: null,
  },
];

describe("deduplicateAndRank", () => {
  it("prioritizes query relevance over raw citations", () => {
    const ranked = deduplicateAndRank(papers, "authorial control AI writing");

    expect(ranked[0].id).toBe("match");
  });

  it("deduplicates titles before sorting", () => {
    const duplicate: Paper = { ...papers[1], id: "duplicate" };
    const ranked = deduplicateAndRank([...papers, duplicate], "authorial control AI writing");

    expect(ranked.filter((paper) => paper.title === papers[1].title)).toHaveLength(1);
  });
});
