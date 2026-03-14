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

const RESEARCH_CONTEXT = `Research question: How can audio-first, AI-mediated academic writing workflows be designed to reduce cognitive load while preserving authorial control for people with low vision?

Key constructs:

- Authorial control: the degree to which a writer retains intentional agency over content, structure, and argument direction when delegating sub-tasks to AI
- Low vision: visual impairment not correctable with standard eyewear, affecting acuity, contrast, or visual field
- Cognitive load: mental effort imposed by the interaction design of a writing tool
- Audio-first interaction: systems designed primarily for speech input and text-to-speech output
- AI-mediated writing: using AI assistance for sub-tasks while the human retains authorial control

Relevant domains: HCI, assistive technology, accessible writing tools, speech interfaces, academic writing support, disability and higher education.

Scoring guide:

- 5 = Directly addresses the research question or a key construct
- 4 = Closely related, likely useful for background or methods
- 3 = Tangentially related, worth skimming
- 2 = Peripheral, probably not worth reading
- 1 = Not relevant`;

function stripMarkdownFences(content: string) {
  return content.replace(/^```(?:json)?\s*|\s*```$/g, "").trim();
}

function getPrompt(paper: PaperInput) {
  return `You are scoring academic search results for a PhD researcher.

${RESEARCH_CONTEXT}

Return JSON only in this shape:
{"score":1,"reason":"one sentence"}

Paper:
Title: ${paper.title}
Authors: ${paper.authors ?? "Unknown"}
Year: ${paper.year ?? "Unknown"}
Abstract: ${paper.abstract ?? "No abstract available"}`;
}

async function scorePaper(paper: PaperInput, apiKey: string, model: string): Promise<ScoredPaper> {
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
        messages: [{ role: "user", content: getPrompt(paper) }],
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

  const { papers } = (await req.json()) as { papers?: PaperInput[] };

  if (!Array.isArray(papers)) {
    return NextResponse.json({ error: "Papers are required" }, { status: 400 });
  }

  const scored = await Promise.all(papers.map((paper) => scorePaper(paper, apiKey, model)));
  scored.sort((a, b) => b.score - a.score);

  return NextResponse.json({ papers: scored });
}
