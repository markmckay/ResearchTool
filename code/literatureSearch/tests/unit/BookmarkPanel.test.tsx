import { useState } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BookmarkPanel } from "@/components/BookmarkPanel";
import type { WorkspacePaper } from "@/types/workspace";

const papers: WorkspacePaper[] = [
  {
    id: "paper-1",
    title: "Audio-First Writing Systems",
    authors: "Jane Doe",
    year: 2024,
    abstract: "First abstract.",
    citations: 10,
    venue: "CHI",
    source: "OpenAlex",
    pdfUrl: null,
    doi: null,
    status: "Inbox",
    tags: ["audio", "workflow"],
    notes: "",
    savedAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "paper-2",
    title: "Accessible Research Pipelines",
    authors: "John Roe",
    year: 2023,
    abstract: "Second abstract.",
    citations: 6,
    venue: "ASSETS",
    source: "Semantic Scholar",
    pdfUrl: null,
    doi: null,
    status: "Read",
    tags: ["accessibility"],
    notes: "Useful for background",
    savedAt: "2026-01-02T00:00:00.000Z",
    updatedAt: "2026-01-02T00:00:00.000Z",
  },
];

function renderPanel() {
  const onUpdateStatus = vi.fn();
  const onUpdateTags = vi.fn();
  const onUpdateNotes = vi.fn();

  function StatefulPanel() {
    const [bookmarks, setBookmarks] = useState(papers);

    return (
      <BookmarkPanel
        bookmarks={bookmarks}
        open
        onClose={vi.fn()}
        onRemove={vi.fn()}
        onReadAloud={vi.fn()}
        onExport={vi.fn()}
        onUpdateStatus={(id, status) => {
          onUpdateStatus(id, status);
          setBookmarks((current) =>
            current.map((bookmark) => (bookmark.id === id ? { ...bookmark, status } : bookmark))
          );
        }}
        onUpdateTags={(id, tags) => {
          onUpdateTags(id, tags);
          setBookmarks((current) =>
            current.map((bookmark) => (bookmark.id === id ? { ...bookmark, tags } : bookmark))
          );
        }}
        onUpdateNotes={(id, notes) => {
          onUpdateNotes(id, notes);
          setBookmarks((current) =>
            current.map((bookmark) => (bookmark.id === id ? { ...bookmark, notes } : bookmark))
          );
        }}
      />
    );
  }

  render(<StatefulPanel />);

  return { onUpdateStatus, onUpdateTags, onUpdateNotes };
}

describe("BookmarkPanel", () => {
  it("filters saved papers by workspace status and tag", async () => {
    const user = userEvent.setup();
    renderPanel();

    await user.click(screen.getByRole("button", { name: "Read" }));

    expect(screen.getByText("Accessible Research Pipelines")).toBeInTheDocument();
    expect(screen.queryByText("Audio-First Writing Systems")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "accessibility" }));

    expect(screen.getByText("Accessible Research Pipelines")).toBeInTheDocument();
    expect(screen.queryByText("Audio-First Writing Systems")).not.toBeInTheDocument();
  });

  it("sends status, tag, and notes edits through the workspace callbacks", async () => {
    const user = userEvent.setup();
    const { onUpdateStatus, onUpdateTags, onUpdateNotes } = renderPanel();

    await user.selectOptions(
      screen.getByRole("combobox", { name: /set workspace status for audio-first writing systems/i }),
      "Priority"
    );
    expect(onUpdateStatus).toHaveBeenCalledWith("paper-1", "Priority");

    await user.type(
      screen.getByRole("textbox", { name: /add a tag to audio-first writing systems/i }),
      " synthesis"
    );
    await user.click(screen.getAllByRole("button", { name: "Add" })[0]);
    expect(onUpdateTags).toHaveBeenCalledWith("paper-1", ["audio", "workflow", "synthesis"]);

    const firstPaperCard = screen
      .getByText("Audio-First Writing Systems")
      .closest("li");

    expect(firstPaperCard).not.toBeNull();

    await user.type(
      within(firstPaperCard as HTMLElement).getByRole("textbox", {
        name: /notes/i,
      }),
      "Capture this for chapter 2."
    );
    expect(onUpdateNotes).toHaveBeenLastCalledWith(
      "paper-1",
      "Capture this for chapter 2."
    );
  });
});
