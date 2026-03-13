import {
  createWorkspacePaper,
  isWorkspaceStatus,
  migrateWorkspacePaper,
  normalizeTags,
} from "@/lib/workspace";
import type { Paper } from "@/types/paper";

const paper: Paper = {
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
};

describe("workspace helpers", () => {
  it("creates a workspace paper with the expected defaults", () => {
    const created = createWorkspacePaper(paper);

    expect(created).toMatchObject({
      ...paper,
      status: "Inbox",
      tags: [],
      notes: "",
    });
    expect(created.savedAt).toEqual(created.updatedAt);
  });

  it("normalizes migrated tags and falls back invalid statuses", () => {
    const migrated = migrateWorkspacePaper({
      ...paper,
      status: "Done",
      tags: [" AI ", "ai", "machine   learning", "", 42],
    });

    expect(migrated).toMatchObject({
      ...paper,
      status: "Inbox",
      tags: ["AI", "machine learning"],
    });
  });

  it("deduplicates tags case-insensitively while preserving order", () => {
    expect(normalizeTags([" AI ", "ai", "Notes", "notes", ""])).toEqual(["AI", "Notes"]);
  });

  it("recognizes valid workspace statuses", () => {
    expect(isWorkspaceStatus("Priority")).toBe(true);
    expect(isWorkspaceStatus("Done")).toBe(false);
  });
});
