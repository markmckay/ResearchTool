import { NextRequest } from "next/server";

const extractConclusionFromPdfUrl = vi.fn();

vi.mock("@/lib/pdfConclusion", () => ({
  extractConclusionFromPdfUrl: (...args: unknown[]) => extractConclusionFromPdfUrl(...args),
}));

const { POST } = await import("@/app/api/summarize/route");

const originalEnv = process.env;
const originalFetch = global.fetch;

function createRequest(body: Record<string, unknown>) {
  return new NextRequest("http://localhost/api/summarize", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
  });
}

describe("summarize route", () => {
  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.OPENROUTER_API_KEY;
    delete process.env.OPENROUTER_MODEL;
    global.fetch = originalFetch;
    extractConclusionFromPdfUrl.mockReset().mockResolvedValue(null);
  });

  afterAll(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
  });

  it("returns a configuration error when OpenRouter settings are missing", async () => {
    const response = await POST(
      createRequest({
        title: "Audio-First Research Tools",
        abstract: "A study.",
        authors: "Jane Doe",
        year: 2024,
        pdfUrl: null,
      })
    );

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      notConfigured: true,
    });
  });

  it("requires an abstract before sending a summarization request", async () => {
    process.env.OPENROUTER_API_KEY = "key";
    process.env.OPENROUTER_MODEL = "openrouter/test-model";

    const response = await POST(
      createRequest({
        title: "Audio-First Research Tools",
        abstract: "",
        authors: "Jane Doe",
        year: 2024,
        pdfUrl: null,
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Abstract is required" });
  });

  it("returns the OpenRouter summary payload on success", async () => {
    process.env.OPENROUTER_API_KEY = "key";
    process.env.OPENROUTER_MODEL = "openrouter/test-model";
    extractConclusionFromPdfUrl.mockResolvedValue(
      "The paper concludes that audio-first workflows reduce friction for low-vision researchers."
    );
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content:
                '```json\n{"overview":"Clear summary text.","keyFindings":"The paper concludes that audio-first workflows reduce friction."}\n```',
            },
          },
        ],
      }),
    }) as typeof fetch;

    const response = await POST(
      createRequest({
        title: "Audio-First Research Tools",
        abstract: "A study.",
        authors: "Jane Doe",
        year: 2024,
        pdfUrl: "https://example.com/paper.pdf",
      })
    );

    expect(global.fetch).toHaveBeenCalledWith(
      "https://openrouter.ai/api/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
      })
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      summary: {
        overview: "Clear summary text.",
        keyFindings: "The paper concludes that audio-first workflows reduce friction.",
        keyFindingsSource: "pdf",
        pdfExtractionStatus: "success",
      },
    });
  });

  it("returns a service error when OpenRouter responds unsuccessfully", async () => {
    process.env.OPENROUTER_API_KEY = "key";
    process.env.OPENROUTER_MODEL = "openrouter/test-model";
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({}),
    }) as typeof fetch;

    const response = await POST(
      createRequest({
        title: "Audio-First Research Tools",
        abstract: "A study.",
        authors: "Jane Doe",
        year: 2024,
        pdfUrl: null,
      })
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "Summarization failed. Please try again.",
    });
  });

  it("falls back to a single overview when the model does not return structured JSON", async () => {
    process.env.OPENROUTER_API_KEY = "key";
    process.env.OPENROUTER_MODEL = "openrouter/test-model";
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "Plain summary only." } }],
      }),
    }) as typeof fetch;

    const response = await POST(
      createRequest({
        title: "Audio-First Research Tools",
        abstract: "A study.",
        authors: "Jane Doe",
        year: 2024,
        pdfUrl: null,
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      summary: {
        overview: "Plain summary only.",
        keyFindings: "Likely conclusions were not available in a structured format.",
        keyFindingsSource: "unavailable",
        pdfExtractionStatus: "not_attempted",
      },
    });
  });

  it("marks PDF extraction failure and falls back to abstract inference", async () => {
    process.env.OPENROUTER_API_KEY = "key";
    process.env.OPENROUTER_MODEL = "openrouter/test-model";
    extractConclusionFromPdfUrl.mockResolvedValue(null);
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content:
                '{"overview":"Overview text.","keyFindings":"Likely abstract-based findings."}',
            },
          },
        ],
      }),
    }) as typeof fetch;

    const response = await POST(
      createRequest({
        title: "Audio-First Research Tools",
        abstract: "A study.",
        authors: "Jane Doe",
        year: 2024,
        pdfUrl: "https://example.com/paper.pdf",
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      summary: {
        overview: "Overview text.",
        keyFindings: "Likely abstract-based findings.",
        keyFindingsSource: "abstract",
        pdfExtractionStatus: "failed",
      },
    });
  });
});
