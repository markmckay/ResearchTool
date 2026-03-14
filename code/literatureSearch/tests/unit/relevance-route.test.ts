import { NextRequest } from "next/server";
import { POST } from "@/app/api/relevance/route";

const originalEnv = process.env;
const originalFetch = global.fetch;

function createRequest(body: Record<string, unknown>) {
  return new NextRequest("http://localhost/api/relevance", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
  });
}

describe("relevance route", () => {
  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.OPENROUTER_API_KEY;
    delete process.env.OPENROUTER_MODEL;
    delete process.env.RELEVANCE_MODEL;
    global.fetch = originalFetch;
  });

  afterAll(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
  });

  it("returns notConfigured when OpenRouter settings are missing", async () => {
    const response = await POST(
      createRequest({
        papers: [{ id: "paper-1", title: "Audio tools", abstract: "This abstract is long enough to score." }],
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      notConfigured: true,
      papers: [],
    });
  });

  it("returns score zero without calling OpenRouter when the abstract is too short", async () => {
    process.env.OPENROUTER_API_KEY = "key";
    process.env.OPENROUTER_MODEL = "openrouter/test-model";
    global.fetch = vi.fn() as typeof fetch;

    const response = await POST(
      createRequest({
        papers: [{ id: "paper-1", title: "Audio tools", abstract: "Too short" }],
      })
    );

    expect(global.fetch).not.toHaveBeenCalled();
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      papers: [{ id: "paper-1", title: "Audio tools", abstract: "Too short", score: 0, reason: "No abstract available" }],
    });
  });

  it("scores papers, strips markdown fences, and sorts by descending score", async () => {
    process.env.OPENROUTER_API_KEY = "key";
    process.env.OPENROUTER_MODEL = "openrouter/test-model";
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: '```json\n{"score":3,"reason":"Useful background paper."}\n```' } }],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: '{"score":5,"reason":"Directly studies audio-first writing support."}' } }],
        }),
      }) as typeof fetch;

    const response = await POST(
      createRequest({
        papers: [
          {
            id: "paper-1",
            title: "Background research",
            abstract: "This abstract is comfortably above the minimum character count for scoring.",
          },
          {
            id: "paper-2",
            title: "Audio-first writing",
            abstract: "This abstract is also comfortably above the minimum character count for scoring.",
          },
        ],
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      papers: [
        {
          id: "paper-2",
          title: "Audio-first writing",
          abstract: "This abstract is also comfortably above the minimum character count for scoring.",
          score: 5,
          reason: "Directly studies audio-first writing support.",
        },
        {
          id: "paper-1",
          title: "Background research",
          abstract: "This abstract is comfortably above the minimum character count for scoring.",
          score: 3,
          reason: "Useful background paper.",
        },
      ],
    });
  });

  it("falls back to score zero when an individual paper cannot be scored", async () => {
    process.env.OPENROUTER_API_KEY = "key";
    process.env.RELEVANCE_MODEL = "openrouter/relevance-model";
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: '{"score":"bad"}' } }],
      }),
    }) as typeof fetch;

    const response = await POST(
      createRequest({
        papers: [
          {
            id: "paper-1",
            title: "Audio-first writing",
            abstract: "This abstract is comfortably above the minimum character count for scoring.",
          },
        ],
      })
    );

    expect(global.fetch).toHaveBeenCalledWith(
      "https://openrouter.ai/api/v1/chat/completions",
      expect.objectContaining({
        body: expect.stringContaining('"model":"openrouter/relevance-model"'),
      })
    );
    await expect(response.json()).resolves.toEqual({
      papers: [
        {
          id: "paper-1",
          title: "Audio-first writing",
          abstract: "This abstract is comfortably above the minimum character count for scoring.",
          score: 0,
          reason: "Could not score",
        },
      ],
    });
  });
});
