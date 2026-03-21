import { NextRequest, NextResponse } from "next/server";
import { extractConclusionFromPdfUrl } from "@/lib/pdfConclusion";

function stripMarkdownFences(content: string) {
  return content.replace(/^```(?:json)?\s*|\s*```$/g, "").trim();
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL;

  if (!apiKey || !model) {
    return NextResponse.json(
      {
        error:
          "AI summarization is not yet configured. Add your OPENROUTER_API_KEY and OPENROUTER_MODEL to .env.local to enable this feature.",
        notConfigured: true,
      },
      { status: 503 }
    );
  }

  const { title, abstract, authors, year, pdfUrl } = await req.json();

  if (!abstract) {
    return NextResponse.json({ error: "Abstract is required" }, { status: 400 });
  }

  const attemptedPdfExtraction = typeof pdfUrl === "string" && pdfUrl.trim().length > 0;
  const extractedConclusion = attemptedPdfExtraction
    ? await extractConclusionFromPdfUrl(pdfUrl)
    : null;

  const prompt = `You are helping a PhD researcher with low vision who uses audio-first tools.

Return JSON only in this shape:
{"overview":"2-3 sentences","keyFindings":"2-3 sentences"}

Requirements:
- The overview should explain the problem, approach, and why the paper matters.
- The keyFindings field should summarize the paper's conclusion or main findings.
- If conclusion text is provided below, ground keyFindings in that text.
- If no conclusion text is provided, infer likely findings from the abstract only.
- Be explicit and readable when spoken aloud.
- Do not mention that you are an AI or apologize.

Paper: "${title}" by ${authors} (${year ?? "year unknown"})

Abstract: ${abstract}

Conclusion text:
${extractedConclusion ?? "Not available from PDF extraction."}

Structured summary:`;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: "Summarization failed. Please try again." },
      { status: 500 }
    );
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  try {
    const parsed = JSON.parse(stripMarkdownFences(content ?? ""));
    const overview = typeof parsed?.overview === "string" ? parsed.overview.trim() : "";
    const keyFindings =
      typeof parsed?.keyFindings === "string" ? parsed.keyFindings.trim() : "";

    if (!overview || !keyFindings) {
      throw new Error("Invalid structured summary payload");
    }

    return NextResponse.json({
      summary: {
        overview,
        keyFindings,
        keyFindingsSource: extractedConclusion ? "pdf" : "abstract",
        pdfExtractionStatus: attemptedPdfExtraction
          ? extractedConclusion
            ? "success"
            : "failed"
          : "not_attempted",
      },
    });
  } catch {
    return NextResponse.json(
      {
        summary: {
          overview:
            typeof content === "string" && content.trim().length > 0
              ? content.trim()
              : "Could not generate summary.",
          keyFindings: extractedConclusion
            ? extractedConclusion
            : "Likely conclusions were not available in a structured format.",
          keyFindingsSource: extractedConclusion ? "pdf" : attemptedPdfExtraction ? "abstract" : "unavailable",
          pdfExtractionStatus: attemptedPdfExtraction
            ? extractedConclusion
              ? "success"
              : "failed"
            : "not_attempted",
        },
      }
    );
  }
}
