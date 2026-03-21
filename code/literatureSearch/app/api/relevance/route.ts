import { NextRequest, NextResponse } from "next/server";

interface PaperInput {
  id: string;
  title: string;
  abstract?: string;
  authors?: string;
  year?: number | null;
}

interface ScoredPaper extends PaperInput {
  score: number;
  reason: string;
}

function stripMarkdownFences(content: string) {
  return content.replace(/^```(?:json)?\s*|\s*```$/g, "").trim();
}

function getPrompt(paper: PaperInput, query: string) {
  return `You are scoring academic search results for a PhD researcher.

Score this paper against the user's live search query, not general topic quality.

User search query: ${query}

Scoring guide:
- 5 = Direct match for the search query
- 4 = Strong match, likely useful
- 3 = Partial match, worth skimming
- 2 = Weak match
- 1 = Not meaningfully related

Return JSON only in this shape:
{"score":1,"reason":"one sentence"}

The reason must explain how the title and abstract relate to the query in plain language.

Paper:
Title: ${paper.title}
Authors: ${paper.authors ?? "Unknown"}
Year: ${paper.year ?? "Unknown"}
Abstract: ${paper.abstract ?? "No abstract available"}`;
}

async function scorePaper(
  paper: PaperInput,
  query: string,
  apiKey: string,
  model: string
): Promise<ScoredPaper> {
  if (!paper.abstract || paper.abstract.trim().length < 30) {
    return { ...paper, score: 0, reason: "No abstract available" };
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        max_tokens: 100,
        messages: [{ role: "user", content: getPrompt(paper, query) }],
      }),
    });

    if (!response.ok) {
      throw new Error("OpenRouter request failed");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    const parsed = JSON.parse(stripMarkdownFences(content ?? ""));
    const score = Number(parsed?.score);
    const reason = typeof parsed?.reason === "string" ? parsed.reason.trim() : "";

    if (!Number.isFinite(score) || score < 1 || score > 5 || reason.length === 0) {
      throw new Error("Invalid relevance payload");
    }

    return { ...paper, score, reason };
  } catch {
    return { ...paper, score: 0, reason: "Could not score" };
  }
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.RELEVANCE_MODEL ?? process.env.OPENROUTER_MODEL;

  if (!apiKey || !model) {
    return NextResponse.json(
      {
        notConfigured: true,
        papers: [],
      },
      { status: 200 }
    );
  }

  const { papers, query } = (await req.json()) as { papers?: PaperInput[]; query?: string };

  if (!Array.isArray(papers)) {
    return NextResponse.json({ error: "Papers are required" }, { status: 400 });
  }

  if (typeof query !== "string" || query.trim().length === 0) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  const scored = await Promise.all(
    papers.map((paper) => scorePaper(paper, query, apiKey, model))
  );
  scored.sort((a, b) => b.score - a.score);

  return NextResponse.json({ papers: scored });
}
