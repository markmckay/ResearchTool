"use client";
import { forwardRef, useState } from "react";
import { Bookmark, BookmarkCheck, Volume2, VolumeX, ExternalLink, FileText, Sparkles } from "lucide-react";
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

export const PaperCard = forwardRef<HTMLButtonElement, Props>(function PaperCard({
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
}, titleButtonRef) {
  const [expanded, setExpanded] = useState(false);
  const titleId = `paper-title-${index}`;
  const metaId = `paper-meta-${index}`;

  return (
    <article
      aria-labelledby={titleId}
      className="bg-white/[0.03] hover:bg-white/[0.05] border border-white/10 hover:border-accent/30 focus-within:border-accent/40 rounded-2xl p-6 transition-all"
    >
      {/* Title + bookmark */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-start gap-2 mb-2">
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
            <button
              type="button"
              onClick={() => onReadTitle(paper)}
              aria-label={
                titleSpeaking
                  ? `Stop title preview for ${paper.title}`
                  : `Speak title and citation details for ${paper.title}`
              }
              className="text-accent hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 rounded-lg p-1.5 shrink-0 transition-all"
            >
              {titleSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
          <p id={metaId} className="text-subtle text-sm mb-3">
            {paper.authors}
            {paper.year ? ` · ${paper.year}` : ""}
            {paper.venue ? ` · ${paper.venue}` : ""}
          </p>
          <div className="flex gap-2 flex-wrap">
            <span className={`text-xs px-3 py-0.5 rounded-full border ${
              paper.source === "arXiv"
                ? "bg-orange-500/10 text-orange-300 border-orange-500/20"
                : paper.source === "IEEE"
                ? "bg-blue-500/10 text-blue-300 border-blue-500/20"
                : "bg-accent/10 text-accent border-accent/20"
            }`}>
              {paper.source}
            </span>
            <span className="bg-accent-green/10 text-accent-green border border-accent-green/20 text-xs px-3 py-0.5 rounded-full">
              {paper.citations.toLocaleString()} citations
            </span>
          </div>
        </div>

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
          className="text-muted hover:text-accent transition-colors p-1 shrink-0 mt-1"
        >
          {isBookmarked ? (
            <BookmarkCheck className="w-5 h-5 text-accent" />
          ) : (
            <Bookmark className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Abstract */}
      <div className="mt-4">
        <p
          className={`text-subtle text-sm leading-relaxed mb-3 ${
            expanded ? "" : "line-clamp-3"
          }`}
        >
          {paper.abstract}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 mt-2">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          className="text-xs text-muted hover:text-foreground border border-white/10 hover:border-white/20 rounded-lg px-3 py-1.5 transition-all"
        >
          {expanded ? "▲ Collapse" : "▼ Full abstract"}
        </button>

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
    </article>
  );
});
