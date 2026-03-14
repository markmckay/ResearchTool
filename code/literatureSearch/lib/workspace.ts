import type { Paper } from "@/types/paper";
import type { WorkspacePaper, WorkspaceStatus } from "@/types/workspace";

const DEFAULT_STATUS: WorkspaceStatus = "Inbox";
const VALID_WORKSPACE_STATUSES = new Set<WorkspaceStatus>([
  "Inbox",
  "Maybe",
  "Priority",
  "Read",
  "Excluded",
]);

function normalizeRelevanceScore(value: unknown): number | undefined {
  return typeof value === "number" && value >= 0 && value <= 5 ? value : undefined;
}

function normalizeRelevanceReason(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

export function createWorkspacePaper(paper: Paper): WorkspacePaper {
  const timestamp = new Date().toISOString();

  return {
    ...paper,
    status: DEFAULT_STATUS,
    exclusionReason: "",
    tags: [],
    notes: "",
    savedAt: timestamp,
    updatedAt: timestamp,
  };
}

export function mergePaperIntoWorkspacePaper(
  bookmark: WorkspacePaper,
  paper: Paper
): WorkspacePaper {
  return {
    ...bookmark,
    ...paper,
    status: bookmark.status,
    exclusionReason: bookmark.exclusionReason,
    tags: bookmark.tags,
    notes: bookmark.notes,
    savedAt: bookmark.savedAt,
    updatedAt: new Date().toISOString(),
  };
}

export function isWorkspaceStatus(value: unknown): value is WorkspaceStatus {
  return typeof value === "string" && VALID_WORKSPACE_STATUSES.has(value as WorkspaceStatus);
}

export function migrateWorkspacePaper(value: unknown): WorkspacePaper | null {
  if (!value || typeof value !== "object") return null;

  const candidate = value as Partial<WorkspacePaper & Paper>;
  if (typeof candidate.id !== "string" || typeof candidate.title !== "string") {
    return null;
  }

  const paper: Paper = {
    id: candidate.id,
    title: candidate.title,
    authors: typeof candidate.authors === "string" ? candidate.authors : "",
    year: typeof candidate.year === "number" || candidate.year === null ? candidate.year : null,
    abstract: typeof candidate.abstract === "string" ? candidate.abstract : "No abstract available.",
    relevanceScore: normalizeRelevanceScore(candidate.relevanceScore),
    relevanceReason: normalizeRelevanceReason(candidate.relevanceReason),
    citations: typeof candidate.citations === "number" ? candidate.citations : 0,
    venue: typeof candidate.venue === "string" ? candidate.venue : "",
    source:
      candidate.source === "Semantic Scholar" ||
      candidate.source === "OpenAlex" ||
      candidate.source === "arXiv" ||
      candidate.source === "IEEE"
        ? candidate.source
        : "OpenAlex",
    pdfUrl: typeof candidate.pdfUrl === "string" || candidate.pdfUrl === null ? candidate.pdfUrl : null,
    doi: typeof candidate.doi === "string" || candidate.doi === null ? candidate.doi : null,
  };

  const status = isWorkspaceStatus(candidate.status) ? candidate.status : DEFAULT_STATUS;

  return {
    ...paper,
    status,
    exclusionReason: typeof candidate.exclusionReason === "string" ? candidate.exclusionReason : "",
    tags: Array.isArray(candidate.tags)
      ? normalizeTags(candidate.tags.filter((tag): tag is string => typeof tag === "string"))
      : [],
    notes: typeof candidate.notes === "string" ? candidate.notes : "",
    savedAt: typeof candidate.savedAt === "string" ? candidate.savedAt : new Date().toISOString(),
    updatedAt: typeof candidate.updatedAt === "string" ? candidate.updatedAt : new Date().toISOString(),
  };
}

export function normalizeTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const tag of tags) {
    const value = tag.trim().replace(/\s+/g, " ");
    if (!value) continue;

    const key = value.toLowerCase();
    if (seen.has(key)) continue;

    seen.add(key);
    normalized.push(value);
  }

  return normalized;
}
