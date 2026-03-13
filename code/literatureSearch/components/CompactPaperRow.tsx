"use client";
import { forwardRef, useState } from "react";
import {
  Bookmark,
  BookmarkCheck,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FileText,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";
import type { Paper } from "@/types/paper";

interface Props {
  paper: Paper;
  index: number;
  isBookmarked: boolean;
  onBookmark: (paper: Paper) => void;
  onRemoveBookmark: (id: string) => void;
  onReadTitle: (paper: Paper) => void;
  onReadAloud: (paper: Paper) => void;
  onSummarize: (paper: Paper) => void;
  titleSpeaking: boolean;
  abstractSpeaking: boolean;
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
    titleSpeaking,
    abstractSpeaking,
  },
  titleButtonRef
) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article className="bg-white/[0.03] hover:bg-white/[0.05] border border-white/10 hover:border-accent/30 rounded-2xl px-5 py-4 transition-all">
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
        <div className="min-w-0">
          <h3 className="font-serif text-lg font-bold text-foreground leading-snug">
            <button
              ref={titleButtonRef}
              type="button"
              onClick={() => onReadTitle(paper)}
              className="text-left hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 rounded-md transition-colors"
            >
              <span className="text-muted mr-2">{index + 1}.</span>
              {paper.title}
            </button>
          </h3>
          <p className="text-subtle text-sm mt-2">
            {paper.authors}
            {paper.year ? ` · ${paper.year}` : ""}
            {paper.venue ? ` · ${paper.venue}` : ""}
          </p>
          <div className="flex gap-2 flex-wrap mt-2">
            <span className="bg-accent/10 text-accent border border-accent/20 text-xs px-3 py-0.5 rounded-full">
              {paper.source}
            </span>
            <span className="bg-accent-green/10 text-accent-green border border-accent-green/20 text-xs px-3 py-0.5 rounded-full">
              {paper.citations.toLocaleString()} citations
            </span>
          </div>
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
          <button
            type="button"
            onClick={() =>
              isBookmarked ? onRemoveBookmark(paper.id) : onBookmark(paper)
            }
            aria-label={
              isBookmarked
                ? `Remove ${paper.title} from bookmarks`
                : `Bookmark ${paper.title}`
            }
            aria-pressed={isBookmarked}
            className="text-muted hover:text-accent transition-colors p-1.5 shrink-0"
          >
            {isBookmarked ? (
              <BookmarkCheck className="w-4 h-4 text-accent" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-subtle text-sm leading-relaxed">
            {paper.abstract}
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
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
              aria-label={`Get plain language summary of ${paper.title}`}
              className="flex items-center gap-1.5 text-xs text-accent-green border border-accent-green/20 hover:bg-accent-green/10 rounded-lg px-3 py-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Summarize
            </button>

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
        </div>
      )}
    </article>
  );
});
