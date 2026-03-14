import { NextRequest, NextResponse } from "next/server";
import { searchSemanticScholar } from "@/lib/semanticScholar";
import { searchOpenAlex } from "@/lib/openAlex";
import { searchArxiv } from "@/lib/arxiv";
import { searchIEEE } from "@/lib/ieee";
import { deduplicateAndRank } from "@/lib/deduplicate";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q");
  if (!query || query.trim().length === 0) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  const [ss, oa, ax, ieee] = await Promise.allSettled([
    searchSemanticScholar(query, 10),
    searchOpenAlex(query, 10),
    searchArxiv(query, 8),
    searchIEEE(query, 8),
  ]);

  const combined = [
    ...(ss.status === "fulfilled" ? ss.value : []),
    ...(oa.status === "fulfilled" ? oa.value : []),
    ...(ax.status === "fulfilled" ? ax.value : []),
    ...(ieee.status === "fulfilled" ? ieee.value : []),
  ];

  const results = deduplicateAndRank(combined, query);

  const sources = {
    semanticScholar: ss.status === "fulfilled",
    openAlex: oa.status === "fulfilled",
    arxiv: ax.status === "fulfilled",
    ieee: ieee.status === "fulfilled",
    ieeeConfigured: !!process.env.IEEE_API_KEY,
  };

  return NextResponse.json({ results, sources });
}
