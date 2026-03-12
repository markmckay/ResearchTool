"use client";
import { useState, useRef } from "react";

const QUICK_SEARCHES = [
  "authorial control AI writing",
  "low vision academic writing assistive technology",
  "speech to text cognitive load accessibility",
  "human AI co-writing agency ownership",
  "audio first interaction design disability",
  "screen reader higher education writing tools",
];

interface Props {
  onSearch: (query: string) => void;
  loading: boolean;
}

export function SearchBar({ onSearch, loading }: Props) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (query.trim()) onSearch(query.trim());
  };

  const handleQuick = (q: string) => {
    setQuery(q);
    inputRef.current?.focus();
  };

  return (
    <section aria-label="Search for papers" className="mb-8">
      <label
        htmlFor="search-input"
        className="block text-xs font-semibold tracking-widest text-muted uppercase mb-3"
      >
        Search query
      </label>

      <div className="flex gap-3">
        <input
          ref={inputRef}
          id="search-input"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="e.g. authorial control AI writing accessibility"
          aria-label="Enter your research search query"
          aria-describedby="search-hint"
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 text-foreground text-base placeholder:text-muted focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || !query.trim()}
          aria-label="Search for papers"
          className="bg-accent/85 hover:bg-accent disabled:bg-accent/30 disabled:cursor-wait text-background font-bold rounded-xl px-6 py-3.5 text-sm transition-all whitespace-nowrap"
        >
          {loading ? "Searching…" : "Search"}
        </button>
      </div>

      <p id="search-hint" className="text-xs text-muted mt-2">
        Press Enter to search · Quick searches fill the box only · Results sorted by citation count
      </p>

      <div className="mt-5">
        <p className="text-xs font-semibold tracking-widest text-muted uppercase mb-2">
          Quick searches for your research
        </p>
        <div className="flex flex-wrap gap-2" role="list" aria-label="Quick search suggestions">
          {QUICK_SEARCHES.map((qs) => (
            <button
              type="button"
              key={qs}
              role="listitem"
              onClick={() => handleQuick(qs)}
              aria-label={`Quick search: ${qs}`}
              className="bg-white/4 hover:bg-accent/10 border border-white/10 hover:border-accent/30 text-subtle hover:text-accent rounded-full px-4 py-1.5 text-xs transition-all"
            >
              {qs}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
