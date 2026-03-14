import {
  createWorkspacePaper,
  isWorkspaceStatus,
  mergePaperIntoWorkspacePaper,
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
  relevanceScore: 4,
  relevanceReason: "Strong fit for accessible academic writing workflows.",
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
      exclusionReason: "",
      tags: [],
      notes: "",
      relevanceScore: 4,
      relevanceReason: "Strong fit for accessible academic writing workflows.",
    });
    expect(created.savedAt).toEqual(created.updatedAt);
  });

  it("normalizes migrated tags and falls back invalid statuses", () => {
    const migrated = migrateWorkspacePaper({
      ...paper,
      status: "Done",
      relevanceScore: 3,
      relevanceReason: "Useful background",
      tags: [" AI ", "ai", "machine   learning", "", 42],
    });

    expect(migrated).toMatchObject({
      ...paper,
      status: "Inbox",
      exclusionReason: "",
      tags: ["AI", "machine learning"],
      relevanceScore: 3,
      relevanceReason: "Useful background",
    });
  });

  it("merges refreshed paper metadata into an existing workspace paper", () => {
    const existing = createWorkspacePaper(paper);
    const merged = mergePaperIntoWorkspacePaper(existing, {
      ...paper,
      title: "Updated title",
      relevanceScore: 5,
      relevanceReason: "Direct dissertation match.",
    });

    expect(merged).toMatchObject({
      title: "Updated title",
      relevanceScore: 5,
      relevanceReason: "Direct dissertation match.",
      status: "Inbox",
      tags: [],
      notes: "",
    });
    expect(merged.savedAt).toEqual(existing.savedAt);
    expect(typeof merged.updatedAt).toBe("string");
  });

  it("deduplicates tags case-insensitively while preserving order", () => {
    expect(normalizeTags([" AI ", "ai", "Notes", "notes", ""])).toEqual(["AI", "Notes"]);
  });

  it("recognizes valid workspace statuses", () => {
    expect(isWorkspaceStatus("Priority")).toBe(true);
    expect(isWorkspaceStatus("Done")).toBe(false);
  });
});
