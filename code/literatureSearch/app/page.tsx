"use client";
import { useMemo, useRef, useState } from "react";
import { Bookmark, Volume2, VolumeX } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { PaperCard } from "@/components/PaperCard";
import { CompactPaperRow } from "@/components/CompactPaperRow";
import { BookmarkPanel } from "@/components/BookmarkPanel";
import { SummaryDialog } from "@/components/SummaryDialog";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useSpeech } from "@/hooks/useSpeech";
import { exportBookmarksToDocx } from "@/lib/exportDocx";
import type { Paper, PaperSummary } from "@/types/paper";
import type { WorkspaceStatus } from "@/types/workspace";

export default function Home() {
  const [results, setResults] = useState<Paper[]>([]);
  const [viewMode, setViewMode] = useState<"cards" | "compact">("compact");
  const [sortMode, setSortMode] = useState<"ai-ranked" | "original">("ai-ranked");
  const [relevanceFilter, setRelevanceFilter] = useState<"all" | "high" | "medium" | "low" | "unscored">("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [bookmarkOpen, setBookmarkOpen] = useState(false);
  const [activeSources, setActiveSources] = useState<Record<string, boolean>>({});
  const [relevanceLoading, setRelevanceLoading] = useState(false);
  const [relevanceAnnouncement, setRelevanceAnnouncement] = useState("");
  const [relevanceApplied, setRelevanceApplied] = useState(false);
  const relevanceRequestIdRef = useRef(0);

  // Summary state
  const [summaryPaper, setSummaryPaper] = useState<Paper | null>(null);
  const [summary, setSummary] = useState<PaperSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [summaryNotConfigured, setSummaryNotConfigured] = useState(false);
  const [summaryCache, setSummaryCache] = useState<Record<string, PaperSummary>>({});

  const {
    bookmarks,
    addBookmark,
    saveWorkspacePaper,
    removeBookmark,
    isBookmarked,
    updateBookmarkStatus,
    updateBookmarkTags,
    updateBookmarkNotes,
    updateBookmarkExclusionReason,
  } = useBookmarks();
  const { speak, stop, speaking, toggleSpeak, isSpeakingKey } = useSpeech();

  const displayedResults = useMemo(() => {
    const filtered = results.filter((paper) => {
      const score = paper.relevanceScore ?? 0;

      if (relevanceFilter === "high") {
        return score >= 4;
      }

      if (relevanceFilter === "medium") {
        return score === 3;
      }

      if (relevanceFilter === "low") {
        return score > 0 && score <= 2;
      }

      if (relevanceFilter === "unscored") {
        return score === 0;
      }

      return true;
    });

    if (sortMode !== "ai-ranked" || !relevanceApplied) {
      return filtered;
    }

    return filtered
      .map((paper, index) => ({ paper, index }))
      .sort((a, b) => {
        const scoreDiff = (b.paper.relevanceScore ?? 0) - (a.paper.relevanceScore ?? 0);
        return scoreDiff !== 0 ? scoreDiff : a.index - b.index;
      })
      .map(({ paper }) => paper);
  }, [relevanceApplied, relevanceFilter, results, sortMode]);

  const scoreResultsByRelevance = async (papers: Paper[], query: string, requestId: number) => {
    if (papers.length === 0) {
      return;
    }

    setRelevanceLoading(true);
    setRelevanceAnnouncement("Ranking by relevance…");

    try {
      const res = await fetch("/api/relevance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          papers: papers.map((paper) => ({
            id: paper.id,
            title: paper.title,
            abstract: paper.abstract,
            authors: paper.authors,
            year: paper.year,
          })),
        }),
      });
      const data = await res.json().catch(() => null);

      if (requestId !== relevanceRequestIdRef.current) {
        return;
      }

      if (data?.notConfigured || !res.ok || !Array.isArray(data?.papers)) {
        setRelevanceApplied(false);
        setRelevanceAnnouncement("");
        return;
      }

      const scores = new Map<string, { score: number; reason: string }>(
        data.papers.map((paper: { id: string; score: number; reason: string }) => [
          paper.id,
          {
            score: paper.score,
            reason: paper.reason,
          },
        ])
      );

      setResults((currentResults) =>
        currentResults.map((paper) => ({
          ...paper,
          relevanceScore: scores.get(paper.id)?.score ?? 0,
          relevanceReason: scores.get(paper.id)?.reason,
        }))
      );
      setRelevanceApplied(true);
      setRelevanceAnnouncement("Results re-ranked by relevance.");
    } catch {
      if (requestId !== relevanceRequestIdRef.current) {
        return;
      }

      setRelevanceApplied(false);
      setRelevanceAnnouncement("");
    } finally {
      if (requestId === relevanceRequestIdRef.current) {
        setRelevanceLoading(false);
      }
    }
  };

  const handleSearch = async (query: string) => {
    const requestId = relevanceRequestIdRef.current + 1;
    relevanceRequestIdRef.current = requestId;
    setLoading(true);
    setError(null);
    setResults([]);
    setSearched(true);
    setRelevanceLoading(false);
    setRelevanceAnnouncement("");
    setRelevanceApplied(false);
    setRelevanceFilter("all");
    stop();

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error ?? `Search failed with status ${res.status}.`);
      }
      const nextResults = data.results ?? [];
      setResults(nextResults);
      setActiveSources(data.sources ?? {});
      void scoreResultsByRelevance(nextResults, query, requestId);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Search failed. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReadAloud = (paper: Paper) => {
    toggleSpeak(
      `${paper.title}. By ${paper.authors}. ${paper.year ?? ""}. ${paper.abstract}`,
      `abstract:${paper.id}`
    );
  };

  const handleReadTitle = (paper: Paper) => {
    toggleSpeak(
      `${paper.title}. By ${paper.authors}. ${paper.year ?? "Year unknown"}. ${paper.citations} citations.`,
      `title:${paper.id}`
    );
  };

  const handleReadTop5 = () => {
    const text = displayedResults
      .slice(0, 5)
      .map(
        (p, i) =>
          `Result ${i + 1}: ${p.title}. By ${p.authors}. ${p.year ?? ""}. ${p.citations} citations.`
      )
      .join(" ");
    toggleSpeak(text, "top5");
  };

  const handleSummarize = async (paper: Paper) => {
    setSummaryPaper(paper);
    setSummaryError(null);
    setSummaryNotConfigured(false);

    const cachedSummary = summaryCache[paper.id];
    if (cachedSummary) {
      setSummary(cachedSummary);
      setSummaryLoading(false);
      return;
    }

    setSummary(null);
    setSummaryLoading(true);

    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: paper.title,
          abstract: paper.abstract,
          authors: paper.authors,
          year: paper.year,
          pdfUrl: paper.pdfUrl,
        }),
      });
      const data = await res.json();
      if (data.notConfigured) {
        setSummaryNotConfigured(true);
      } else if (!res.ok) {
        setSummaryError(data.error ?? "Summarization failed.");
      } else {
        const nextSummary = data.summary ?? null;
        setSummary(nextSummary);
        if (nextSummary) {
          setSummaryCache((current) => ({
            ...current,
            [paper.id]: nextSummary,
          }));
        }
      }
    } catch {
      setSummaryError("Could not connect to summarization service.");
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleExport = async () => {
    if (bookmarks.length === 0) return;
    await exportBookmarksToDocx(bookmarks);
  };

  const handleQuickWorkspaceAction = (paper: Paper, status: WorkspaceStatus) => {
    saveWorkspacePaper(paper, status);
  };

  return (
    <div className="min-h-screen px-4 py-12">
      {/* Skip link */}
      <a href="#results" className="skip-link">
        Skip to results
      </a>

      {/* Live region */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {loading
          ? "Searching…"
          : relevanceLoading
          ? "Ranking by relevance…"
          : relevanceAnnouncement
          ? relevanceAnnouncement
          : searched && results.length > 0
          ? `${displayedResults.length} results shown from ${results.length} results. Use headings to move through titles, or activate a title to hear a citation preview.`
          : searched
          ? "No results found."
          : ""}
      </div>

      <main className="max-w-3xl mx-auto">
        {/* Header */}
        <header className="mb-10 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-extrabold mb-3 bg-gradient-to-br from-foreground to-accent bg-clip-text text-transparent">
            Research Literature Search
          </h1>
          <p className="text-muted text-sm tracking-wide">
            Semantic Scholar + OpenAlex · Open access · Audio-first design
          </p>
        </header>

        {/* Toolbar */}
        <div className="flex justify-end gap-2 mb-4">
          {speaking && (
            <button
              onClick={stop}
              aria-label="Stop reading aloud"
              className="flex items-center gap-1.5 text-xs text-accent border border-accent/30 hover:bg-accent/10 rounded-lg px-3 py-1.5 transition-all"
            >
              <VolumeX className="w-3.5 h-3.5" />
              Stop reading
            </button>
          )}
          <form action="/api/auth/logout" method="post">
            <button
              type="submit"
              aria-label="Log out of the app"
              className="flex items-center gap-1.5 text-xs text-subtle border border-white/10 hover:border-white/20 hover:text-foreground rounded-lg px-3 py-1.5 transition-all"
            >
              Log out
            </button>
          </form>
          <button
            onClick={() => setBookmarkOpen(true)}
            aria-label={`Open saved papers panel. ${bookmarks.length} papers saved.`}
            title="Saved papers"
            className="flex items-center gap-1.5 text-xs text-subtle border border-white/10 hover:border-accent/30 hover:text-accent rounded-lg px-2.5 py-1.5 transition-all"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>{bookmarks.length}</span>
          </button>
        </div>

        <SearchBar onSearch={handleSearch} loading={loading} />

        {/* Results */}
        <section
          id="results"
          aria-label="Search results"
          className="outline-none"
        >
          {loading && (
            <div role="status" aria-label="Loading results" className="text-center py-20">
              <div className="w-10 h-10 border-2 border-accent/20 border-t-accent rounded-full mx-auto mb-4 animate-spin" />
              <p className="text-muted text-sm">
                Searching Semantic Scholar and OpenAlex…
              </p>
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-300 text-sm"
            >
              {error}
            </div>
          )}

          {!loading && searched && results.length === 0 && !error && (
            <p className="text-center text-muted py-16 text-sm">
              No results found. Try different search terms.
            </p>
          )}

          {!loading && results.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                <div>
                  <h2 className="font-serif text-base text-subtle mb-2">
                    {displayedResults.length === results.length
                      ? `${results.length} results`
                      : `${displayedResults.length} of ${results.length} results`}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2">
                    {relevanceLoading ? (
                      <p className="text-xs text-muted" aria-hidden="true">
                        Ranking by relevance…
                      </p>
                    ) : null}
                    {relevanceApplied ? (
                      <span className="inline-flex items-center rounded-full border border-accent-green/20 bg-accent-green/10 px-2.5 py-0.5 text-xs text-accent-green">
                        AI-ranked
                      </span>
                    ) : null}
                  </div>
                  {/* Source status badges */}
                  <div className="flex flex-wrap gap-1.5" aria-label="Active sources">
                    {[
                      { key: "semanticScholar", label: "Semantic Scholar" },
                      { key: "openAlex", label: "OpenAlex" },
                      { key: "arxiv", label: "arXiv" },
                      { key: "ieee", label: "IEEE", requiresConfig: !activeSources.ieeeConfigured },
                    ].map(({ key, label, requiresConfig }) => (
                      <span
                        key={key}
                        aria-label={`${label}: ${requiresConfig ? "not configured" : activeSources[key] ? "active" : "unavailable"}`}
                        className={`text-xs px-2.5 py-0.5 rounded-full border ${
                          requiresConfig
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : activeSources[key]
                            ? "bg-accent-green/10 text-accent-green border-accent-green/20"
                            : "bg-white/5 text-muted border-white/10"
                        }`}
                      >
                        {requiresConfig ? `${label} (needs key)` : label}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <div
                    className="inline-flex rounded-lg border border-white/10 p-1"
                    role="group"
                    aria-label="Result order"
                  >
                    <button
                      type="button"
                      onClick={() => setSortMode("ai-ranked")}
                      aria-pressed={sortMode === "ai-ranked"}
                      className={`text-xs rounded-md px-3 py-1.5 transition-all ${
                        sortMode === "ai-ranked"
                          ? "bg-white/10 text-foreground"
                          : "text-subtle hover:text-foreground"
                      }`}
                    >
                      AI-ranked
                    </button>
                    <button
                      type="button"
                      onClick={() => setSortMode("original")}
                      aria-pressed={sortMode === "original"}
                      className={`text-xs rounded-md px-3 py-1.5 transition-all ${
                        sortMode === "original"
                          ? "bg-white/10 text-foreground"
                          : "text-subtle hover:text-foreground"
                      }`}
                    >
                      Original
                    </button>
                  </div>
                  <label className="sr-only" htmlFor="relevance-filter">
                    Filter results by relevance
                  </label>
                  <select
                    id="relevance-filter"
                    value={relevanceFilter}
                    onChange={(event) =>
                      setRelevanceFilter(event.target.value as typeof relevanceFilter)
                    }
                    className="bg-white/[0.04] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-foreground"
                    aria-label="Filter results by relevance"
                  >
                    <option value="all">All scores</option>
                    <option value="high">4-5 only</option>
                    <option value="medium">3 only</option>
                    <option value="low">1-2 only</option>
                    <option value="unscored">Unscored only</option>
                  </select>
                  <div
                    className="inline-flex rounded-lg border border-white/10 p-1"
                    role="group"
                    aria-label="Result layout"
                  >
                    <button
                      type="button"
                      onClick={() => setViewMode("compact")}
                      aria-pressed={viewMode === "compact"}
                      className={`text-xs rounded-md px-3 py-1.5 transition-all ${
                        viewMode === "compact"
                          ? "bg-white/10 text-foreground"
                          : "text-subtle hover:text-foreground"
                      }`}
                    >
                      Compact
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("cards")}
                      aria-pressed={viewMode === "cards"}
                      className={`text-xs rounded-md px-3 py-1.5 transition-all ${
                        viewMode === "cards"
                          ? "bg-white/10 text-foreground"
                          : "text-subtle hover:text-foreground"
                      }`}
                    >
                      Cards
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleReadTop5}
                    aria-label={
                      isSpeakingKey("top5")
                        ? "Stop reading titles of top 5 results aloud"
                        : "Read titles of top 5 results aloud"
                    }
                    className="flex items-center gap-1.5 text-xs text-accent border border-accent/20 hover:bg-accent/10 rounded-lg px-3 py-1.5 transition-all"
                  >
                    {isSpeakingKey("top5") ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    {isSpeakingKey("top5") ? "Stop top 5" : "Top 5 titles"}
                  </button>
                </div>
              </div>

              {displayedResults.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 text-center">
                  <p className="text-sm text-foreground mb-1">No papers match this relevance filter.</p>
                  <p className="text-xs text-muted">
                    Try switching back to all scores or a broader band.
                  </p>
                </div>
              ) : (
              <ol className={viewMode === "compact" ? "space-y-3" : "space-y-4"} aria-label="Paper results">
                {displayedResults.map((paper, i) => (
                  <li key={paper.id}>
                    {viewMode === "compact" ? (
                      <CompactPaperRow
                        paper={paper}
                        index={i}
                        relevanceScore={paper.relevanceScore}
                        relevanceReason={paper.relevanceReason}
                        isBookmarked={isBookmarked(paper.id)}
                        onBookmark={addBookmark}
                        onRemoveBookmark={removeBookmark}
                        onReadTitle={handleReadTitle}
                        onReadAloud={handleReadAloud}
                        onSummarize={handleSummarize}
                        onQuickWorkspaceAction={handleQuickWorkspaceAction}
                        titleSpeaking={isSpeakingKey(`title:${paper.id}`)}
                        abstractSpeaking={isSpeakingKey(`abstract:${paper.id}`)}
                        hasSummary={Boolean(summaryCache[paper.id])}
                        summaryOpen={summaryPaper?.id === paper.id && Boolean(summary)}
                      />
                    ) : (
                      <PaperCard
                        paper={paper}
                        index={i}
                        relevanceScore={paper.relevanceScore}
                        relevanceReason={paper.relevanceReason}
                        isBookmarked={isBookmarked(paper.id)}
                        onBookmark={addBookmark}
                        onRemoveBookmark={removeBookmark}
                        onReadTitle={handleReadTitle}
                        onReadAloud={handleReadAloud}
                        onSummarize={handleSummarize}
                        onQuickWorkspaceAction={handleQuickWorkspaceAction}
                        titleSpeaking={isSpeakingKey(`title:${paper.id}`)}
                        abstractSpeaking={isSpeakingKey(`abstract:${paper.id}`)}
                        hasSummary={Boolean(summaryCache[paper.id])}
                        summaryOpen={summaryPaper?.id === paper.id && Boolean(summary)}
                      />
                    )}
                  </li>
                ))}
              </ol>
              )}
            </>
          )}
        </section>
      </main>

      {/* Bookmark panel */}
      <BookmarkPanel
        bookmarks={bookmarks}
        open={bookmarkOpen}
        onClose={() => setBookmarkOpen(false)}
        onRemove={removeBookmark}
        onReadAloud={(p) => handleReadAloud(p)}
        onExport={handleExport}
        onUpdateStatus={updateBookmarkStatus}
        onUpdateTags={updateBookmarkTags}
        onUpdateNotes={updateBookmarkNotes}
        onUpdateExclusionReason={updateBookmarkExclusionReason}
      />

      {/* Summary dialog */}
      <SummaryDialog
        paper={summaryPaper}
        summary={summary}
        loading={summaryLoading}
        error={summaryError}
        notConfigured={summaryNotConfigured}
        onClose={() => setSummaryPaper(null)}
        onReadAloud={speak}
      />
    </div>
  );
}
