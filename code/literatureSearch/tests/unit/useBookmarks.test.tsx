import { render, screen, waitFor } from "@testing-library/react";
import { useBookmarks } from "@/hooks/useBookmarks";

const STORAGE_KEY = "literature-search-bookmarks";

function BookmarksHarness() {
  const { bookmarks } = useBookmarks();

  return <pre data-testid="bookmarks">{JSON.stringify(bookmarks)}</pre>;
}

describe("useBookmarks", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("hydrates migrated bookmarks and persists the repaired shape", async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        {
          id: "paper-1",
          title: "Designing Audio-First Research Tools",
          authors: "Jane Doe",
          year: 2024,
          abstract: "A study about low-friction literature workflows.",
          citations: 12,
          venue: "CHI",
          source: "OpenAlex",
          pdfUrl: null,
          doi: null,
          status: "Done",
          tags: [" AI ", "ai", "notes"],
        },
      ])
    );

    render(<BookmarksHarness />);

    await waitFor(() => {
      expect(screen.getByTestId("bookmarks")).toHaveTextContent('"status":"Inbox"');
    });

    expect(screen.getByTestId("bookmarks")).toHaveTextContent('"tags":["AI","notes"]');

    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]")).toEqual([
      expect.objectContaining({
        id: "paper-1",
        status: "Inbox",
        tags: ["AI", "notes"],
      }),
    ]);
  });
});
