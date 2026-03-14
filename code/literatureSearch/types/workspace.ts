import type { Paper } from "@/types/paper";

export const WORKSPACE_STATUSES = [
  "Inbox",
  "Maybe",
  "Priority",
  "Read",
  "Excluded",
] as const;

export type WorkspaceStatus = (typeof WORKSPACE_STATUSES)[number];

export interface WorkspacePaper extends Paper {
  status: WorkspaceStatus;
  exclusionReason: string;
  tags: string[];
  notes: string;
  savedAt: string;
  updatedAt: string;
}
