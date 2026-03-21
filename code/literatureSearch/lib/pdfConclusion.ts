import { PDFParse } from "pdf-parse";

const CONCLUSION_HEADINGS = [
  "conclusion",
  "conclusions",
  "conclusion and future work",
  "conclusions and future work",
  "discussion and conclusion",
  "discussion and conclusions",
  "discussion",
  "general discussion",
  "key findings",
  "findings",
  "summary and conclusion",
  "summary",
  "closing remarks",
];

const STOP_HEADINGS = [
  "references",
  "bibliography",
  "acknowledg",
  "appendix",
  "supplement",
  "future work",
  "limitations",
  "author contributions",
];

function normalizeLine(line: string) {
  return line
    .toLowerCase()
    .replace(/^\d+(\.\d+)*\s+/, "")
    .replace(/[^a-z0-9\s:&/-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isHeadingLike(line: string) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.length > 90) return false;
  if (/[.!?;:]$/.test(trimmed)) return false;
  const words = trimmed.split(/\s+/);
  if (words.length > 10) return false;
  return /^[A-Za-z0-9\s:&/-]+$/.test(trimmed);
}

function sentenceCount(text: string) {
  return (text.match(/[.!?](?:\s|$)/g) ?? []).length;
}

function splitIntoSentences(text: string) {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function extractTailFindings(text: string): string | null {
  const normalizedText = text.replace(/\s+/g, " ").trim();
  if (!normalizedText) return null;

  const tail = normalizedText.slice(Math.max(0, normalizedText.length - 5000));
  const phraseMatch = tail.match(
    /\b(in conclusion|to conclude|we conclude|our findings suggest|these findings suggest|this study shows|this paper shows)\b/i
  );
  if (phraseMatch && typeof phraseMatch.index === "number") {
    const snippet = tail.slice(phraseMatch.index).trim();
    const candidate = splitIntoSentences(snippet).slice(0, 4).join(" ").trim() || snippet.slice(0, 500).trim();
    if (candidate.length >= 20) {
      return candidate;
    }
  }

  const sentences = splitIntoSentences(tail);
  const startIndex = sentences.findIndex((sentence) =>
    /\b(in conclusion|to conclude|we conclude|our findings suggest|these findings suggest|this study shows|this paper shows)\b/i.test(
      sentence
    )
  );

  if (startIndex === -1) {
    return null;
  }

  const candidate = sentences.slice(startIndex, startIndex + 4).join(" ").trim();
  return candidate.length >= 20 ? candidate : null;
}

export function extractConclusionFromText(text: string): string | null {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const startIndex = lines.findIndex((line) => {
    const normalized = normalizeLine(line);
    return CONCLUSION_HEADINGS.some((heading) => normalized === heading || normalized.startsWith(`${heading} `));
  });

  if (startIndex === -1) {
    return extractTailFindings(text);
  }

  const collected: string[] = [];
  for (let index = startIndex + 1; index < lines.length; index += 1) {
    const line = lines[index];
    const normalized = normalizeLine(line);

    if (
      collected.length > 0 &&
      isHeadingLike(line) &&
      STOP_HEADINGS.some((heading) => normalized.startsWith(heading))
    ) {
      break;
    }

    if (
      collected.length > 1 &&
      isHeadingLike(line) &&
      CONCLUSION_HEADINGS.every((heading) => !normalized.startsWith(heading))
    ) {
      break;
    }

    collected.push(line);

    if (collected.join(" ").length >= 1800 || sentenceCount(collected.join(" ")) >= 8) {
      break;
    }
  }

  const section = collected.join(" ").replace(/\s+/g, " ").trim();
  if (section.length >= 120) {
    return section;
  }

  return extractTailFindings(text);
}

export async function extractConclusionFromPdfUrl(pdfUrl: string): Promise<string | null> {
  const parser = new PDFParse({ url: pdfUrl });

  try {
    const result = await parser.getText();
    return extractConclusionFromText(result.text ?? "");
  } catch {
    return null;
  } finally {
    await parser.destroy().catch(() => undefined);
  }
}
