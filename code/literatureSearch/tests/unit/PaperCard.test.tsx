import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PaperCard } from "@/components/PaperCard";
import type { Paper } from "@/types/paper";

const paper: Paper = {
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
};

describe("PaperCard", () => {
  it("uses the title as the primary speech trigger", async () => {
    const user = userEvent.setup();
    const onReadTitle = vi.fn();

    render(
      <PaperCard
        paper={paper}
        index={0}
        isBookmarked={false}
        onBookmark={vi.fn()}
        onRemoveBookmark={vi.fn()}
        onReadTitle={onReadTitle}
        onReadAloud={vi.fn()}
        onSummarize={vi.fn()}
        titleSpeaking={false}
        abstractSpeaking={false}
      />
    );

    await user.click(screen.getByRole("button", { name: /^1\.\s*designing audio-first research tools/i }));

    expect(onReadTitle).toHaveBeenCalledWith(paper);
  });

  it("keeps abstract reading as a separate action", async () => {
    const user = userEvent.setup();
    const onReadAloud = vi.fn();

    render(
      <PaperCard
        paper={paper}
        index={0}
        isBookmarked={false}
        onBookmark={vi.fn()}
        onRemoveBookmark={vi.fn()}
        onReadTitle={vi.fn()}
        onReadAloud={onReadAloud}
        onSummarize={vi.fn()}
        titleSpeaking={false}
        abstractSpeaking={false}
      />
    );

    await user.click(screen.getByRole("button", { name: /read abstract of designing audio-first research tools aloud/i }));

    expect(onReadAloud).toHaveBeenCalledWith(paper);
  });
});
