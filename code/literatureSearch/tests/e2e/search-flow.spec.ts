import { expect, test } from "@playwright/test";

const results = [
  {
    id: "paper-1",
    title: "Designing Audio-First Research Tools",
    authors: "Jane Doe, John Roe",
    year: 2024,
    abstract: "A study about low-vision-friendly research tooling.",
    citations: 18,
    venue: "CHI",
    source: "OpenAlex",
    pdfUrl: "https://example.com/paper.pdf",
    doi: "10.1000/example",
  },
  {
    id: "paper-2",
    title: "Speech-Driven Academic Search Interfaces",
    authors: "Alex Smith",
    year: 2023,
    abstract: "A study about speech-first result triage.",
    citations: 9,
    venue: "ASSETS",
    source: "Semantic Scholar",
    pdfUrl: null,
    doi: null,
  },
];

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const spoken: string[] = [];
    const synth = {
      cancel: () => {},
      speak: (utterance: SpeechSynthesisUtterance) => {
        spoken.push(utterance.text);
        utterance.onstart?.(new Event("start") as SpeechSynthesisEvent);
      },
    };

    Object.defineProperty(window, "speechSynthesis", {
      configurable: true,
      value: synth,
    });

    Object.defineProperty(window, "__spoken", {
      configurable: true,
      value: spoken,
      writable: false,
    });
  });

  await page.route("**/api/search**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        results,
        sources: {
          semanticScholar: true,
          openAlex: true,
          arxiv: false,
          ieee: false,
          ieeeConfigured: false,
        },
      }),
    });
  });
});

test("quick search chips fill the box without auto-searching", async ({ page }) => {
  let searchRequests = 0;
  page.on("request", (request) => {
    if (request.url().includes("/api/search")) {
      searchRequests += 1;
    }
  });

  await page.goto("/");
  await page.getByRole("listitem", { name: /quick search: authorial control ai writing/i }).click();

  await expect(page.getByRole("searchbox", { name: /enter your research search query/i })).toHaveValue(
    "authorial control AI writing"
  );
  expect(searchRequests).toBe(0);
});

test("search results load without forcing the page to jump down", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("searchbox", { name: /enter your research search query/i }).fill("authorial control AI writing");
  await page.getByRole("button", { name: /search for papers/i }).click();

  await expect(page.getByRole("heading", { name: /^2 results$/i })).toBeVisible();
  await expect(page.getByText(/^AI-ranked$/i)).toBeVisible();

  const scrollY = await page.evaluate(() => window.scrollY);
  expect(scrollY).toBeLessThan(80);
});

test("titles are actionable and speak a short citation preview", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("searchbox", { name: /enter your research search query/i }).fill("authorial control AI writing");
  await page.getByRole("button", { name: /search for papers/i }).click();

  const titleButton = page.getByRole("button", { name: /^1\.\s*designing audio-first research tools/i });
  await expect(titleButton).toBeVisible();
  await titleButton.click();

  const spoken = await page.evaluate(() => (window as typeof window & { __spoken: string[] }).__spoken);
  expect(spoken[0]).toContain("Designing Audio-First Research Tools");
  expect(spoken[0]).toContain("18 citations");
});

test("top five reader toggles to stop while speaking", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("searchbox", { name: /enter your research search query/i }).fill("authorial control AI writing");
  await page.getByRole("button", { name: /search for papers/i }).click();

  const topFiveButton = page.getByRole("button", { name: /read titles of top 5 results aloud/i });
  await topFiveButton.click();
  await expect(page.getByRole("button", { name: /stop reading titles of top 5 results aloud/i })).toBeVisible();
});
