"use client";
import { useState, useRef } from "react";
import { Bookmark, Volume2, VolumeX } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { PaperCard } from "@/components/PaperCard";
import { BookmarkPanel } from "@/components/BookmarkPanel";
import { SummaryDialog } from "@/components/SummaryDialog";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useSpeech } from "@/hooks/useSpeech";
import { exportBookmarksToDocx } from "@/lib/exportDocx";
import type { Paper } from "@/types/paper";

export default function Home() {
  const [results, setResults] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [bookmarkOpen, setBookmarkOpen] = useState(false);
  const [activeSources, setActiveSources] = useState<Record<string, boolean>>({});

  // Summary state
  const [summaryPaper, setSummaryPaper] = useState<Paper | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [summaryNotConfigured, setSummaryNotConfigured] = useState(false);

  const { bookmarks, addBookmark, removeBookmark, isBookmarked } = useBookmarks();
  const { speak, stop, speaking, toggleSpeak, isSpeakingKey } = useSpeech();
  const firstResultTitleRef = useRef<HTMLButtonElement>(null);

  const handleSearch = async (query: string) => {
    setLoading(true);
    setError(null);
    setResults([]);
    setSearched(true);
    stop();

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error ?? `Search failed with status ${res.status}.`);
      }
      setResults(data.results ?? []);
      setActiveSources(data.sources ?? {});
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
    const text = results
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
    setSummary(null);
    setSummaryError(null);
    setSummaryNotConfigured(false);
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
        }),
      });
      const data = await res.json();
      if (data.notConfigured) {
        setSummaryNotConfigured(true);
      } else if (!res.ok) {
        setSummaryError(data.error ?? "Summarization failed.");
      } else {
        setSummary(data.summary);
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
          : searched && results.length > 0
          ? `${results.length} results found. Use headings to move through titles, or activate a title to hear a citation preview.`
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
        <div className="flex justify-end gap-3 mb-4">
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
          <button
            onClick={() => setBookmarkOpen(true)}
            aria-label={`Open saved papers panel. ${bookmarks.length} papers saved.`}
            className="flex items-center gap-2 text-xs text-subtle border border-white/10 hover:border-accent/30 hover:text-accent rounded-lg px-3 py-1.5 transition-all"
          >
            <Bookmark className="w-3.5 h-3.5" />
            Saved ({bookmarks.length})
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
                    {results.length} results · sorted by citations
                  </h2>
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
                  <button
                    type="button"
                    onClick={() => firstResultTitleRef.current?.focus()}
                    aria-label="Move keyboard focus to the first result title"
                    className="text-xs text-subtle border border-white/10 hover:border-white/20 hover:text-foreground rounded-lg px-3 py-1.5 transition-all"
                  >
                    Jump to first title
                  </button>
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
                    {isSpeakingKey("top5") ? "Stop top 5" : "Read top 5 titles"}
                  </button>
                </div>
              </div>

              <ol className="space-y-4" aria-label="Paper results">
                {results.map((paper, i) => (
                  <li key={paper.id}>
                    <PaperCard
                      ref={i === 0 ? firstResultTitleRef : undefined}
                      paper={paper}
                      index={i}
                      isBookmarked={isBookmarked(paper.id)}
                      onBookmark={addBookmark}
                      onRemoveBookmark={removeBookmark}
                      onReadTitle={handleReadTitle}
                      onReadAloud={handleReadAloud}
                      onSummarize={handleSummarize}
                      titleSpeaking={isSpeakingKey(`title:${paper.id}`)}
                      abstractSpeaking={isSpeakingKey(`abstract:${paper.id}`)}
                    />
                  </li>
                ))}
              </ol>
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
