import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "AI summarization is not yet configured. Add your ANTHROPIC_API_KEY to .env.local to enable this feature.",
        notConfigured: true,
      },
      { status: 503 }
    );
  }

  const { title, abstract, authors, year } = await req.json();

  if (!abstract) {
    return NextResponse.json({ error: "Abstract is required" }, { status: 400 });
  }

  const prompt = `You are helping a PhD researcher with low vision who uses audio-first tools. Summarize this academic paper in plain, clear language that works well when read aloud. Keep it to 3-4 sentences. Focus on: what problem it addresses, what approach it takes, and why it matters.

Paper: "${title}" by ${authors} (${year ?? "year unknown"})

Abstract: ${abstract}

Plain language summary:`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
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
  const summary = data.content?.[0]?.text ?? "Could not generate summary.";
  return NextResponse.json({ summary });
}
