"use client";
import { X, BookmarkCheck, Volume2 } from "lucide-react";
import type { Paper } from "@/types/paper";

interface Props {
  bookmarks: Paper[];
  open: boolean;
  onClose: () => void;
  onRemove: (id: string) => void;
  onReadAloud: (paper: Paper) => void;
  onExport: () => void;
}

export function BookmarkPanel({
  bookmarks,
  open,
  onClose,
  onRemove,
  onReadAloud,
  onExport,
}: Props) {
  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Saved papers"
        className="fixed right-0 top-0 h-full w-full max-w-md bg-[#0f172a] border-l border-white/10 z-50 flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="font-serif text-xl font-bold text-foreground">
              Saved Papers
            </h2>
            <p className="text-xs text-muted mt-0.5">
              {bookmarks.length} {bookmarks.length === 1 ? "paper" : "papers"} saved
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close saved papers panel"
            className="text-muted hover:text-foreground transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {bookmarks.length === 0 ? (
            <div className="text-center py-16">
              <BookmarkCheck className="w-10 h-10 text-muted mx-auto mb-3" />
              <p className="text-muted text-sm">
                No papers saved yet. Click the bookmark icon on any result to save it here.
              </p>
            </div>
          ) : (
            <ul className="space-y-4" aria-label="Saved papers list">
              {bookmarks.map((paper, i) => (
                <li
                  key={paper.id}
                  className="bg-white/[0.03] border border-white/10 rounded-xl p-4"
                >
                  <p className="text-xs text-muted mb-1">
                    {i + 1} of {bookmarks.length}
                  </p>
                  <h3 className="font-serif text-sm font-bold text-foreground leading-snug mb-1">
                    {paper.title}
                  </h3>
                  <p className="text-xs text-subtle mb-3">
                    {paper.authors}{paper.year ? ` · ${paper.year}` : ""}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => onReadAloud(paper)}
                      aria-label={`Read ${paper.title} aloud`}
                      className="flex items-center gap-1 text-xs text-accent border border-accent/20 hover:bg-accent/10 rounded-lg px-2.5 py-1 transition-all"
                    >
                      <Volume2 className="w-3 h-3" />
                      Read
                    </button>
                    <button
                      onClick={() => onRemove(paper.id)}
                      aria-label={`Remove ${paper.title} from saved papers`}
                      className="text-xs text-muted border border-white/10 hover:border-red-500/30 hover:text-red-400 rounded-lg px-2.5 py-1 transition-all"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {bookmarks.length > 0 && (
          <div className="p-6 border-t border-white/10">
            <button
              onClick={onExport}
              className="w-full bg-accent/85 hover:bg-accent text-background font-bold rounded-xl py-3 text-sm transition-all"
              aria-label="Export saved papers to a Word document"
            >
              Export to Word Document
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
