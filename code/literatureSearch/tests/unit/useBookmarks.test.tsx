import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useBookmarks } from "@/hooks/useBookmarks";

const STORAGE_KEY = "literature-search-bookmarks";

function BookmarksHarness() {
  const { bookmarks, addBookmark } = useBookmarks();

  return (
    <>
      <button
        type="button"
        onClick={() =>
          addBookmark({
            id: "paper-1",
            title: "Designing Audio-First Research Tools",
            authors: "Jane Doe",
            year: 2024,
            abstract: "A study about low-friction literature workflows.",
            relevanceScore: 5,
            relevanceReason: "Directly supports the dissertation topic.",
            citations: 12,
            venue: "CHI",
            source: "OpenAlex",
            pdfUrl: null,
            doi: null,
          })
        }
      >
        Refresh bookmark
      </button>
      <pre data-testid="bookmarks">{JSON.stringify(bookmarks)}</pre>
    </>
  );
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
          relevanceScore: 4,
          relevanceReason: "Useful background paper.",
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
        exclusionReason: "",
        tags: ["AI", "notes"],
        relevanceScore: 4,
        relevanceReason: "Useful background paper.",
      }),
    ]);
  });

  it("refreshes an existing bookmark with new relevance metadata", async () => {
    const user = userEvent.setup();
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
          status: "Inbox",
          exclusionReason: "",
          tags: ["AI"],
          notes: "",
          savedAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      ])
    );

    render(<BookmarksHarness />);

    await user.click(screen.getByRole("button", { name: /refresh bookmark/i }));

    await waitFor(() => {
      expect(screen.getByTestId("bookmarks")).toHaveTextContent('"relevanceScore":5');
    });
    expect(screen.getByTestId("bookmarks")).toHaveTextContent(
      '"relevanceReason":"Directly supports the dissertation topic."'
    );
  });
});
