import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "@/app/page";
import type { Paper } from "@/types/paper";

const mockUseBookmarks = vi.fn();
const mockUseSpeech = vi.fn();
const exportBookmarksToDocx = vi.fn();
const mockFetch = vi.fn();

vi.mock("@/hooks/useBookmarks", () => ({
  useBookmarks: () => mockUseBookmarks(),
}));

vi.mock("@/hooks/useSpeech", () => ({
  useSpeech: () => mockUseSpeech(),
}));

vi.mock("@/lib/exportDocx", () => ({
  exportBookmarksToDocx: (...args: unknown[]) => exportBookmarksToDocx(...args),
}));

vi.mock("@/components/PaperCard", () => ({
  PaperCard: ({ paper, onSummarize, onReadTitle, onQuickWorkspaceAction, relevanceScore, relevanceReason }: { paper: Paper; onSummarize: (paper: Paper) => void; onReadTitle: (paper: Paper) => void; onQuickWorkspaceAction?: (paper: Paper, status: "Priority" | "Maybe" | "Excluded") => void; relevanceScore?: number; relevanceReason?: string }) => (
    <div data-testid={`card-${paper.id}`}>
      <span>{paper.title}</span>
      <span>{relevanceScore ? `Relevance: ${relevanceScore}/5` : "No relevance"}</span>
      <span>{relevanceReason ?? "No reason"}</span>
      <button type="button" onClick={() => onReadTitle(paper)}>
        Title action {paper.id}
      </button>
      <button type="button" onClick={() => onSummarize(paper)}>
        Summarize {paper.id}
      </button>
      <button type="button" onClick={() => onQuickWorkspaceAction?.(paper, "Priority")}>
        Priority {paper.id}
      </button>
    </div>
  ),
}));

vi.mock("@/components/CompactPaperRow", () => ({
  CompactPaperRow: ({ paper, onSummarize, onReadTitle, onQuickWorkspaceAction, relevanceScore, relevanceReason }: { paper: Paper; onSummarize: (paper: Paper) => void; onReadTitle: (paper: Paper) => void; onQuickWorkspaceAction?: (paper: Paper, status: "Priority" | "Maybe" | "Excluded") => void; relevanceScore?: number; relevanceReason?: string }) => (
    <div data-testid={`row-${paper.id}`}>
      <span>{paper.title}</span>
      <span>{relevanceScore ? `Relevance: ${relevanceScore}/5` : "No relevance"}</span>
      <span>{relevanceReason ?? "No reason"}</span>
      <button type="button" onClick={() => onReadTitle(paper)}>
        Title action {paper.id}
      </button>
      <button type="button" onClick={() => onSummarize(paper)}>
        Summarize {paper.id}
      </button>
      <button type="button" onClick={() => onQuickWorkspaceAction?.(paper, "Excluded")}>
        Exclude {paper.id}
      </button>
    </div>
  ),
}));

vi.mock("@/components/BookmarkPanel", () => ({
  BookmarkPanel: ({
    open,
    bookmarks,
    onExport,
  }: {
    open: boolean;
    bookmarks: Paper[];
    onExport: () => void;
  }) => (
    <div data-testid="bookmark-panel">
      <span>{open ? "open" : "closed"}</span>
      <span>{bookmarks.length}</span>
      <button type="button" onClick={onExport}>
        Export bookmarks
      </button>
    </div>
  ),
}));

vi.mock("@/components/SummaryDialog", () => ({
  SummaryDialog: ({
    paper,
    summary,
    loading,
    error,
    notConfigured,
  }: {
    paper: Paper | null;
    summary: string | null;
    loading: boolean;
    error: string | null;
    notConfigured: boolean;
  }) => (
    <div data-testid="summary-dialog">
      <span>{paper?.title ?? "none"}</span>
      <span>{summary ?? "no-summary"}</span>
      <span>{loading ? "loading" : "idle"}</span>
      <span>{error ?? "no-error"}</span>
      <span>{notConfigured ? "not-configured" : "configured"}</span>
    </div>
  ),
}));

const results: Paper[] = [
  {
    id: "paper-1",
    title: "Audio-First Research Tools",
    authors: "Jane Doe",
    year: 2024,
    abstract: "A study about search workflows.",
    citations: 18,
    venue: "CHI",
    source: "OpenAlex",
    pdfUrl: null,
    doi: null,
  },
  {
    id: "paper-2",
    title: "Speech-Driven Search Interfaces",
    authors: "John Roe",
    year: 2023,
    abstract: "A study about speech.",
    citations: 7,
    venue: "ASSETS",
    source: "Semantic Scholar",
    pdfUrl: null,
    doi: null,
  },
];

describe("Home page", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", mockFetch);
    mockFetch.mockReset();
    exportBookmarksToDocx.mockReset();

    mockUseBookmarks.mockReturnValue({
      bookmarks: [results[0]],
      addBookmark: vi.fn(),
      saveWorkspacePaper: vi.fn(),
      removeBookmark: vi.fn(),
      isBookmarked: vi.fn().mockReturnValue(false),
      updateBookmarkStatus: vi.fn(),
      updateBookmarkTags: vi.fn(),
      updateBookmarkNotes: vi.fn(),
      updateBookmarkExclusionReason: vi.fn(),
    });

    mockUseSpeech.mockReturnValue({
      speak: vi.fn(),
      stop: vi.fn(),
      speaking: false,
      toggleSpeak: vi.fn(),
      isSpeakingKey: vi.fn().mockReturnValue(false),
    });
  });

  it("loads search results, toggles layouts, and opens the bookmark panel", async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results,
        sources: {
          semanticScholar: true,
          openAlex: true,
          arxiv: false,
          ieee: false,
          ieeeConfigured: false,
        },
      }),
    }).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        papers: [
          { id: "paper-2", score: 5, reason: "Directly related." },
          { id: "paper-1", score: 3, reason: "Useful background." },
        ],
      }),
    });

    render(<Home />);

    await user.type(screen.getByRole("searchbox", { name: /enter your research search query/i }), "audio research");
    await user.click(screen.getByRole("button", { name: /search for papers/i }));

    await waitFor(() => {
      expect(screen.getByText(/2 results/i)).toBeInTheDocument();
    });

    expect(mockUseSpeech().stop).toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getByText("Relevance: 5/5")).toBeInTheDocument();
    });
    expect(screen.getByText("AI-ranked")).toBeInTheDocument();
    expect(screen.getByTestId("row-paper-1")).toBeInTheDocument();
    expect(screen.getByLabelText(/IEEE: not configured/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Cards" }));
    expect(screen.getByTestId("card-paper-1")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /open saved papers panel/i }));
    expect(screen.getByTestId("bookmark-panel")).toHaveTextContent("open");
  });

  it("shows API errors from search failures", async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: "Search backend unavailable" }),
    });

    render(<Home />);

    await user.type(screen.getByRole("searchbox", { name: /enter your research search query/i }), "audio research");
    await user.click(screen.getByRole("button", { name: /search for papers/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Search backend unavailable");
    });
  });

  it("shows summary success and configuration-required states", async () => {
    const user = userEvent.setup();
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results,
          sources: {
            semanticScholar: true,
            openAlex: true,
            arxiv: false,
            ieee: false,
            ieeeConfigured: false,
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ notConfigured: true, papers: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ summary: "Helpful summary." }),
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ notConfigured: true }),
      });

    render(<Home />);

    await user.type(screen.getByRole("searchbox", { name: /enter your research search query/i }), "audio research");
    await user.click(screen.getByRole("button", { name: /search for papers/i }));

    await waitFor(() => {
      expect(screen.getByTestId("row-paper-1")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /summarize paper-1/i }));
    await waitFor(() => {
      expect(screen.getByTestId("summary-dialog")).toHaveTextContent("Helpful summary.");
    });

    await user.click(screen.getByRole("button", { name: /summarize paper-2/i }));
    await waitFor(() => {
      expect(screen.getByTestId("summary-dialog")).toHaveTextContent("not-configured");
    });
  });

  it("exports bookmarks only when there are saved papers", async () => {
    const user = userEvent.setup();
    render(<Home />);

    await user.click(screen.getByRole("button", { name: /export bookmarks/i }));
    expect(exportBookmarksToDocx).toHaveBeenCalledWith([results[0]]);

    mockUseBookmarks.mockReturnValueOnce({
      bookmarks: [],
      addBookmark: vi.fn(),
      saveWorkspacePaper: vi.fn(),
      removeBookmark: vi.fn(),
      isBookmarked: vi.fn().mockReturnValue(false),
      updateBookmarkStatus: vi.fn(),
      updateBookmarkTags: vi.fn(),
      updateBookmarkNotes: vi.fn(),
      updateBookmarkExclusionReason: vi.fn(),
    });

    render(<Home />);
    await user.click(screen.getAllByRole("button", { name: /export bookmarks/i })[1]);
    expect(exportBookmarksToDocx).toHaveBeenCalledTimes(1);
  });

  it("sends quick workspace actions from result rows", async () => {
    const user = userEvent.setup();
    const saveWorkspacePaper = vi.fn();

    mockUseBookmarks.mockReturnValue({
      bookmarks: [],
      addBookmark: vi.fn(),
      saveWorkspacePaper,
      removeBookmark: vi.fn(),
      isBookmarked: vi.fn().mockReturnValue(false),
      updateBookmarkStatus: vi.fn(),
      updateBookmarkTags: vi.fn(),
      updateBookmarkNotes: vi.fn(),
      updateBookmarkExclusionReason: vi.fn(),
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results,
        sources: {
          semanticScholar: true,
          openAlex: true,
          arxiv: false,
          ieee: false,
          ieeeConfigured: false,
        },
      }),
    }).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ notConfigured: true, papers: [] }),
    });

    render(<Home />);

    await user.type(screen.getByRole("searchbox", { name: /enter your research search query/i }), "audio research");
    await user.click(screen.getByRole("button", { name: /search for papers/i }));

    await waitFor(() => {
      expect(screen.getByTestId("row-paper-1")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /exclude paper-1/i }));
    expect(saveWorkspacePaper).toHaveBeenCalledWith(results[0], "Excluded");
  });

  it("re-ranks results after relevance scoring and ignores stale batches", async () => {
    const user = userEvent.setup();
    let resolveFirstRelevance: ((value: unknown) => void) | undefined;

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results,
          sources: {
            semanticScholar: true,
            openAlex: true,
            arxiv: false,
            ieee: false,
            ieeeConfigured: false,
          },
        }),
      })
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveFirstRelevance = resolve;
          })
      )
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [...results].reverse(),
          sources: {
            semanticScholar: true,
            openAlex: true,
            arxiv: false,
            ieee: false,
            ieeeConfigured: false,
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          papers: [
            { id: "paper-1", score: 5, reason: "Best match." },
            { id: "paper-2", score: 2, reason: "Peripheral." },
          ],
        }),
      });

    render(<Home />);

    await user.type(screen.getByRole("searchbox", { name: /enter your research search query/i }), "audio research");
    await user.click(screen.getByRole("button", { name: /search for papers/i }));

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent(/ranking by relevance/i);
    });

    await user.clear(screen.getByRole("searchbox", { name: /enter your research search query/i }));
    await user.type(screen.getByRole("searchbox", { name: /enter your research search query/i }), "speech interfaces");
    await user.click(screen.getByRole("button", { name: /search for papers/i }));

    await waitFor(() => {
      expect(screen.getByText("Best match.")).toBeInTheDocument();
    });
    expect(screen.getByText("AI-ranked")).toBeInTheDocument();

    resolveFirstRelevance?.({
      ok: true,
      json: async () => ({
        papers: [
          { id: "paper-2", score: 5, reason: "Stale result." },
          { id: "paper-1", score: 1, reason: "Stale result." },
        ],
      }),
    });

    await waitFor(() => {
      expect(screen.getByText("Results re-ranked by relevance.")).toBeInTheDocument();
    });

    const rows = screen.getAllByTestId(/row-paper-/);
    expect(rows[0]).toHaveAttribute("data-testid", "row-paper-1");
    expect(screen.getByText("Best match.")).toBeInTheDocument();
  });
});
