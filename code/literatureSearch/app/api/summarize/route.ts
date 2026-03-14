import { NextRequest, NextResponse } from "next/server";

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

  const { title, abstract, authors, year } = await req.json();

  if (!abstract) {
    return NextResponse.json({ error: "Abstract is required" }, { status: 400 });
  }

  const prompt = `You are helping a PhD researcher with low vision who uses audio-first tools. Summarize this academic paper in plain, clear language that works well when read aloud. Keep it to 3-4 sentences. Focus on: what problem it addresses, what approach it takes, and why it matters.

Paper: "${title}" by ${authors} (${year ?? "year unknown"})

Abstract: ${abstract}

Plain language summary:`;

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
  const summary = data.choices?.[0]?.message?.content ?? "Could not generate summary.";
  return NextResponse.json({ summary });
}
