"use client";
import type { ForwardedRef } from "react";
import {
  Bookmark,
  BookmarkCheck,
  CircleCheckBig,
  ExternalLink,
  FileText,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";
import type { Paper } from "@/types/paper";
import type { WorkspaceStatus } from "@/types/workspace";

function getSourceBadgeClass(source: Paper["source"]) {
  if (source === "arXiv") {
    return "bg-orange-500/10 text-orange-300 border-orange-500/20";
  }

  if (source === "IEEE") {
    return "bg-blue-500/10 text-blue-300 border-blue-500/20";
  }

  return "bg-accent/10 text-accent border-accent/20";
}

interface PaperTitleButtonProps {
  paper: Paper;
  index: number;
  onReadTitle: (paper: Paper) => void;
  titleButtonRef?: ForwardedRef<HTMLButtonElement>;
  titleId?: string;
  metaId?: string;
}

export function PaperTitleButton({
  paper,
  index,
  onReadTitle,
  titleButtonRef,
  titleId,
  metaId,
}: PaperTitleButtonProps) {
  return (
    <h3 id={titleId} className="font-serif text-lg font-bold text-foreground leading-snug flex-1">
      <button
        ref={titleButtonRef}
        type="button"
        onClick={() => onReadTitle(paper)}
        aria-describedby={metaId}
        className="text-left hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 rounded-md transition-colors"
      >
        <span className="text-muted mr-2">{index + 1}.</span>
        {paper.title}
      </button>
    </h3>
  );
}

interface PaperMetaProps {
  paper: Paper;
  metaId?: string;
  className?: string;
}

export function PaperMeta({ paper, metaId, className = "text-subtle text-sm" }: PaperMetaProps) {
  return (
    <p id={metaId} className={className}>
      {paper.authors}
      {paper.year ? ` · ${paper.year}` : ""}
      {paper.venue ? ` · ${paper.venue}` : ""}
    </p>
  );
}

interface PaperRelevanceBadgeProps {
  relevanceScore?: number;
  relevanceReason?: string;
  className?: string;
}

function getRelevanceClass(score: number) {
  if (score >= 4) {
    return "bg-accent-green/10 text-accent-green border-accent-green/20";
  }

  if (score === 3) {
    return "bg-amber-500/10 text-amber-300 border-amber-500/20";
  }

  return "bg-white/5 text-muted border-white/10";
}

export function PaperRelevanceBadge({
  relevanceScore,
  relevanceReason,
  className = "mb-3",
}: PaperRelevanceBadgeProps) {
  if (!relevanceScore || relevanceScore <= 0) {
    return null;
  }

  return (
    <div className={className}>
      <div
        className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-medium ${getRelevanceClass(
          relevanceScore
        )}`}
      >
        Relevance: {relevanceScore}/5
      </div>
      {relevanceReason ? (
        <p className="mt-1 text-xs text-subtle leading-relaxed">
          {relevanceReason}
        </p>
      ) : null}
    </div>
  );
}

interface PaperBadgesProps {
  paper: Paper;
  className?: string;
}

export function PaperBadges({ paper, className = "flex gap-2 flex-wrap" }: PaperBadgesProps) {
  return (
    <div className={className}>
      <span className={`text-xs px-3 py-0.5 rounded-full border ${getSourceBadgeClass(paper.source)}`}>
        {paper.source}
      </span>
      <span className="bg-accent-green/10 text-accent-green border border-accent-green/20 text-xs px-3 py-0.5 rounded-full">
        {paper.citations.toLocaleString()} citations
      </span>
    </div>
  );
}

interface BookmarkToggleButtonProps {
  paper: Paper;
  isBookmarked: boolean;
  onBookmark: (paper: Paper) => void;
  onRemoveBookmark: (id: string) => void;
  className: string;
  iconClassName: string;
}

export function BookmarkToggleButton({
  paper,
  isBookmarked,
  onBookmark,
  onRemoveBookmark,
  className,
  iconClassName,
}: BookmarkToggleButtonProps) {
  return (
    <button
      type="button"
      onClick={() => (isBookmarked ? onRemoveBookmark(paper.id) : onBookmark(paper))}
      aria-label={isBookmarked ? `Remove ${paper.title} from bookmarks` : `Bookmark ${paper.title}`}
      aria-pressed={isBookmarked}
      className={className}
    >
      {isBookmarked ? (
        <BookmarkCheck className={`${iconClassName} text-accent`} />
      ) : (
        <Bookmark className={iconClassName} />
      )}
    </button>
  );
}

interface PaperActionButtonsProps {
  paper: Paper;
  onReadAloud: (paper: Paper) => void;
  onSummarize: (paper: Paper) => void;
  onQuickWorkspaceAction?: (paper: Paper, status: WorkspaceStatus) => void;
  abstractSpeaking: boolean;
  hasSummary?: boolean;
  summaryOpen?: boolean;
  className?: string;
}

interface PaperQuickPreviewProps {
  paper: Paper;
  relevanceReason?: string;
}

export function PaperQuickPreview({ paper, relevanceReason }: PaperQuickPreviewProps) {
  return (
    <div className="space-y-3">
      {relevanceReason ? (
        <section aria-label="Why this matches your search">
          <p className="text-xs font-medium uppercase tracking-wide text-accent-green mb-1">
            Why it matches
          </p>
          <p className="text-sm text-foreground leading-relaxed">{relevanceReason}</p>
        </section>
      ) : null}
      <section aria-label="Abstract">
        <p className="text-xs font-medium uppercase tracking-wide text-muted mb-1">Abstract</p>
        <p className="text-subtle text-sm leading-relaxed">{paper.abstract}</p>
      </section>
    </div>
  );
}

export function PaperActionButtons({
  paper,
  onReadAloud,
  onSummarize,
  onQuickWorkspaceAction,
  abstractSpeaking,
  hasSummary = false,
  summaryOpen = false,
  className = "flex flex-wrap gap-2",
}: PaperActionButtonsProps) {
  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => onReadAloud(paper)}
        aria-label={
          abstractSpeaking
            ? `Stop reading abstract of ${paper.title}`
            : `Read abstract of ${paper.title} aloud`
        }
        className="flex items-center gap-1.5 text-xs text-accent border border-accent/20 hover:bg-accent/10 rounded-lg px-3 py-1.5 transition-all"
      >
        {abstractSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        {abstractSpeaking ? "Stop abstract" : "Read abstract"}
      </button>

      <button
        type="button"
        onClick={() => onSummarize(paper)}
        aria-label={
          summaryOpen
            ? `Reopen quick view for ${paper.title}`
            : hasSummary
            ? `Open saved quick view for ${paper.title}`
            : `Get plain language summary of ${paper.title}`
        }
        className="flex items-center gap-1.5 text-xs text-accent-green border border-accent-green/20 hover:bg-accent-green/10 rounded-lg px-3 py-1.5 transition-all"
      >
        <Sparkles className="w-3.5 h-3.5" />
        {summaryOpen ? "Quick view open" : hasSummary ? "Open quick view" : "Summarize"}
      </button>

      {onQuickWorkspaceAction && (
        <>
          <button
            type="button"
            onClick={() => onQuickWorkspaceAction(paper, "Priority")}
            aria-label={`Mark ${paper.title} as priority`}
            className="flex items-center gap-1.5 text-xs text-amber-300 border border-amber-500/20 hover:bg-amber-500/10 rounded-lg px-3 py-1.5 transition-all"
          >
            <CircleCheckBig className="w-3.5 h-3.5" />
            Priority
          </button>
          <button
            type="button"
            onClick={() => onQuickWorkspaceAction(paper, "Maybe")}
            aria-label={`Mark ${paper.title} as maybe`}
            className="text-xs text-subtle border border-white/10 hover:border-white/20 hover:text-foreground rounded-lg px-3 py-1.5 transition-all"
          >
            Maybe
          </button>
          <button
            type="button"
            onClick={() => onQuickWorkspaceAction(paper, "Excluded")}
            aria-label={`Exclude ${paper.title}`}
            className="text-xs text-red-300 border border-red-500/20 hover:bg-red-500/10 rounded-lg px-3 py-1.5 transition-all"
          >
            Exclude
          </button>
        </>
      )}

      {paper.pdfUrl && (
        <a
          href={paper.pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open PDF for ${paper.title}`}
          className="flex items-center gap-1.5 text-xs text-accent-green border border-accent-green/20 hover:bg-accent-green/10 rounded-lg px-3 py-1.5 transition-all"
        >
          <FileText className="w-3.5 h-3.5" />
          PDF
        </a>
      )}

      {paper.doi && (
        <a
          href={`https://doi.org/${paper.doi}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open DOI link for ${paper.title}`}
          className="flex items-center gap-1.5 text-xs text-muted border border-white/10 hover:border-white/20 hover:text-subtle rounded-lg px-3 py-1.5 transition-all"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          DOI
        </a>
      )}
    </div>
  );
}
