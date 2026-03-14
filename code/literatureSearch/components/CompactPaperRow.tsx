"use client";
import { forwardRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  BookmarkToggleButton,
  PaperActionButtons,
  PaperBadges,
  PaperMeta,
  PaperRelevanceBadge,
  PaperTitleButton,
} from "@/components/PaperResultShared";
import type { Paper } from "@/types/paper";
import type { WorkspaceStatus } from "@/types/workspace";

interface Props {
  paper: Paper;
  index: number;
  isBookmarked: boolean;
  onBookmark: (paper: Paper) => void;
  onRemoveBookmark: (id: string) => void;
  onReadTitle: (paper: Paper) => void;
  onReadAloud: (paper: Paper) => void;
  onSummarize: (paper: Paper) => void;
  onQuickWorkspaceAction?: (paper: Paper, status: WorkspaceStatus) => void;
  titleSpeaking: boolean;
  abstractSpeaking: boolean;
  relevanceScore?: number;
  relevanceReason?: string;
}

export const CompactPaperRow = forwardRef<HTMLButtonElement, Props>(function CompactPaperRow(
  {
    paper,
    index,
    isBookmarked,
    onBookmark,
    onRemoveBookmark,
    onReadTitle,
    onReadAloud,
    onSummarize,
    onQuickWorkspaceAction,
    titleSpeaking,
    abstractSpeaking,
    relevanceScore,
    relevanceReason,
  },
  titleButtonRef
) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article className="bg-white/[0.03] hover:bg-white/[0.05] border border-white/10 hover:border-accent/30 rounded-2xl px-5 py-4 transition-all">
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
        <div className="min-w-0">
          <PaperRelevanceBadge
            relevanceScore={relevanceScore}
            relevanceReason={relevanceReason}
            className="mb-2"
          />
          <PaperTitleButton
            paper={paper}
            index={index}
            onReadTitle={onReadTitle}
            titleButtonRef={titleButtonRef}
          />
          <PaperMeta paper={paper} className="text-subtle text-sm mt-2" />
          <PaperBadges paper={paper} className="flex gap-2 flex-wrap mt-2" />
        </div>

        <div className="flex flex-wrap items-start gap-2 md:justify-end">
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            aria-expanded={expanded}
            className="flex items-center gap-1.5 text-xs text-subtle border border-white/10 hover:border-white/20 hover:text-foreground rounded-lg px-3 py-1.5 transition-all"
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {expanded ? "Hide details" : "Show details"}
          </button>
          <BookmarkToggleButton
            paper={paper}
            isBookmarked={isBookmarked}
            onBookmark={onBookmark}
            onRemoveBookmark={onRemoveBookmark}
            className="text-muted hover:text-accent transition-colors p-1.5 shrink-0"
            iconClassName="w-4 h-4"
          />
        </div>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-subtle text-sm leading-relaxed">
            {paper.abstract}
          </p>
          <PaperActionButtons
            paper={paper}
            onReadAloud={onReadAloud}
            onSummarize={onSummarize}
            onQuickWorkspaceAction={onQuickWorkspaceAction}
            abstractSpeaking={abstractSpeaking}
            className="flex flex-wrap gap-2 mt-3"
          />
        </div>
      )}
    </article>
  );
});
