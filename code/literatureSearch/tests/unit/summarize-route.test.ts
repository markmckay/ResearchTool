import { NextRequest } from "next/server";
import { POST } from "@/app/api/summarize/route";

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
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Abstract is required" });
  });

  it("returns the OpenRouter summary payload on success", async () => {
    process.env.OPENROUTER_API_KEY = "key";
    process.env.OPENROUTER_MODEL = "openrouter/test-model";
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "Clear summary text." } }],
      }),
    }) as typeof fetch;

    const response = await POST(
      createRequest({
        title: "Audio-First Research Tools",
        abstract: "A study.",
        authors: "Jane Doe",
        year: 2024,
      })
    );

    expect(global.fetch).toHaveBeenCalledWith(
      "https://openrouter.ai/api/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
      })
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ summary: "Clear summary text." });
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
      })
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "Summarization failed. Please try again.",
    });
  });
});
