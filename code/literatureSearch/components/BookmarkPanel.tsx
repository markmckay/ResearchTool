"use client";
import { useMemo, useState } from "react";
import { BookmarkCheck, Search, Volume2, X } from "lucide-react";
import type { Paper } from "@/types/paper";
import { WORKSPACE_STATUSES } from "@/types/workspace";
import type { WorkspacePaper, WorkspaceStatus } from "@/types/workspace";

interface Props {
  bookmarks: WorkspacePaper[];
  open: boolean;
  onClose: () => void;
  onRemove: (id: string) => void;
  onReadAloud: (paper: Paper) => void;
  onExport: () => void;
  onUpdateStatus: (id: string, status: WorkspaceStatus) => void;
  onUpdateTags: (id: string, tags: string[]) => void;
  onUpdateNotes: (id: string, notes: string) => void;
}

export function BookmarkPanel({
  bookmarks,
  open,
  onClose,
  onRemove,
  onReadAloud,
  onExport,
  onUpdateStatus,
  onUpdateTags,
  onUpdateNotes,
}: Props) {
  const [activeStatuses, setActiveStatuses] = useState<WorkspaceStatus[]>([]);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [tagInputs, setTagInputs] = useState<Record<string, string>>({});

  const availableTags = useMemo(
    () =>
      Array.from(new Set(bookmarks.flatMap((bookmark) => bookmark.tags)))
        .sort((a, b) => a.localeCompare(b)),
    [bookmarks]
  );

  const filteredBookmarks = useMemo(() => {
    return bookmarks.filter((bookmark) => {
      const matchesStatus =
        activeStatuses.length === 0 || activeStatuses.includes(bookmark.status);
      const matchesTags =
        activeTags.length === 0 || activeTags.every((tag) => bookmark.tags.includes(tag));

      return matchesStatus && matchesTags;
    });
  }, [activeStatuses, activeTags, bookmarks]);

  const toggleStatus = (status: WorkspaceStatus) => {
    setActiveStatuses((current) =>
      current.includes(status)
        ? current.filter((value) => value !== status)
        : [...current, status]
    );
  };

  const toggleTag = (tag: string) => {
    setActiveTags((current) =>
      current.includes(tag) ? current.filter((value) => value !== tag) : [...current, tag]
    );
  };

  const clearFilters = () => {
    setActiveStatuses([]);
    setActiveTags([]);
  };

  const addTag = (bookmark: WorkspacePaper) => {
    const value = tagInputs[bookmark.id]?.trim();
    if (!value) return;

    onUpdateTags(bookmark.id, [...bookmark.tags, value]);
    setTagInputs((current) => ({ ...current, [bookmark.id]: "" }));
  };

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
              Research Workspace
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
            <>
              <div className="mb-5 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Filter workspace</h3>
                    <p className="text-xs text-muted">
                      Narrow by stage and theme as you review the literature.
                    </p>
                  </div>
                  {(activeStatuses.length > 0 || activeTags.length > 0) && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="text-xs text-muted hover:text-foreground transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="mb-3">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-muted mb-2">
                    Status
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {WORKSPACE_STATUSES.map((status) => {
                      const active = activeStatuses.includes(status);
                      return (
                        <button
                          key={status}
                          type="button"
                          onClick={() => toggleStatus(status)}
                          aria-pressed={active}
                          className={`text-xs rounded-full border px-3 py-1 transition-all ${
                            active
                              ? "border-accent/40 bg-accent/15 text-accent"
                              : "border-white/10 text-subtle hover:border-white/20 hover:text-foreground"
                          }`}
                        >
                          {status}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-muted mb-2">
                    Tags
                  </p>
                  {availableTags.length === 0 ? (
                    <p className="text-xs text-muted">
                      Add tags to papers and they will appear here for filtering.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {availableTags.map((tag) => {
                        const active = activeTags.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => toggleTag(tag)}
                            aria-pressed={active}
                            className={`text-xs rounded-full border px-3 py-1 transition-all ${
                              active
                                ? "border-accent-green/40 bg-accent-green/10 text-accent-green"
                                : "border-white/10 text-subtle hover:border-white/20 hover:text-foreground"
                            }`}
                          >
                            {tag}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {filteredBookmarks.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 text-center">
                  <Search className="w-5 h-5 text-muted mx-auto mb-2" />
                  <p className="text-sm text-foreground mb-1">No papers match these filters.</p>
                  <p className="text-xs text-muted">
                    Try clearing one of the active status or tag filters.
                  </p>
                </div>
              ) : (
                <ul className="space-y-4" aria-label="Saved papers list">
                  {filteredBookmarks.map((paper, i) => (
                    <li
                      key={paper.id}
                      className="bg-white/[0.03] border border-white/10 rounded-xl p-4"
                    >
                      <p className="text-xs text-muted mb-1">
                        {i + 1} of {filteredBookmarks.length}
                      </p>
                      <h3 className="font-serif text-sm font-bold text-foreground leading-snug mb-1">
                        {paper.title}
                      </h3>
                      <p className="text-xs text-subtle mb-3">
                        {paper.authors}{paper.year ? ` · ${paper.year}` : ""}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <select
                          aria-label={`Set workspace status for ${paper.title}`}
                          value={paper.status}
                          onChange={(event) =>
                            onUpdateStatus(paper.id, event.target.value as WorkspaceStatus)
                          }
                          className="bg-white/[0.04] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-foreground"
                        >
                          {WORKSPACE_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                        <span className="text-xs rounded-full border border-white/10 px-2.5 py-1.5 text-subtle">
                          {paper.source}
                        </span>
                        <span className="text-xs rounded-full border border-accent-green/20 bg-accent-green/10 px-2.5 py-1.5 text-accent-green">
                          {paper.citations.toLocaleString()} citations
                        </span>
                      </div>

                      <div className="mb-3">
                        <label className="block text-[11px] font-semibold uppercase tracking-widest text-muted mb-2">
                          Tags
                        </label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {paper.tags.length === 0 ? (
                            <p className="text-xs text-muted">No tags yet.</p>
                          ) : (
                            paper.tags.map((tag) => (
                              <button
                                key={tag}
                                type="button"
                                onClick={() =>
                                  onUpdateTags(
                                    paper.id,
                                    paper.tags.filter((value) => value !== tag)
                                  )
                                }
                                className="text-xs rounded-full border border-accent-green/20 bg-accent-green/10 px-2.5 py-1 text-accent-green hover:border-accent-green/40"
                                aria-label={`Remove tag ${tag} from ${paper.title}`}
                              >
                                {tag} x
                              </button>
                            ))
                          )}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={tagInputs[paper.id] ?? ""}
                            onChange={(event) =>
                              setTagInputs((current) => ({
                                ...current,
                                [paper.id]: event.target.value,
                              }))
                            }
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                event.preventDefault();
                                addTag(paper);
                              }
                            }}
                            placeholder="Add a tag"
                            className="flex-1 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted"
                            aria-label={`Add a tag to ${paper.title}`}
                          />
                          <button
                            type="button"
                            onClick={() => addTag(paper)}
                            className="text-xs text-subtle border border-white/10 hover:border-white/20 hover:text-foreground rounded-lg px-3 py-2 transition-all"
                          >
                            Add
                          </button>
                        </div>
                      </div>

                      <div className="mb-3">
                        <label
                          htmlFor={`notes-${paper.id}`}
                          className="block text-[11px] font-semibold uppercase tracking-widest text-muted mb-2"
                        >
                          Notes
                        </label>
                        <textarea
                          id={`notes-${paper.id}`}
                          value={paper.notes}
                          onChange={(event) => onUpdateNotes(paper.id, event.target.value)}
                          placeholder="Capture why this matters, possible use in the literature review, or follow-up questions."
                          className="w-full min-h-24 resize-y bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted"
                        />
                      </div>

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
            </>
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
