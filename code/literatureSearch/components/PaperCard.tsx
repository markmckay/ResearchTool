"use client";
import { forwardRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import {
  BookmarkToggleButton,
  PaperActionButtons,
  PaperBadges,
  PaperMeta,
  PaperTitleButton,
} from "@/components/PaperResultShared";
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
            <PaperTitleButton
              paper={paper}
              index={index}
              onReadTitle={onReadTitle}
              titleButtonRef={titleButtonRef}
              titleId={titleId}
              metaId={metaId}
            />
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
          <PaperMeta paper={paper} metaId={metaId} className="text-subtle text-sm mb-3" />
          <PaperBadges paper={paper} />
        </div>

        <BookmarkToggleButton
          paper={paper}
          isBookmarked={isBookmarked}
          onBookmark={onBookmark}
          onRemoveBookmark={onRemoveBookmark}
          className="text-muted hover:text-accent transition-colors p-1 shrink-0 mt-1"
          iconClassName="w-5 h-5"
        />
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

        <PaperActionButtons
          paper={paper}
          onReadAloud={onReadAloud}
          onSummarize={onSummarize}
          abstractSpeaking={abstractSpeaking}
        />
      </div>
    </article>
  );
});
