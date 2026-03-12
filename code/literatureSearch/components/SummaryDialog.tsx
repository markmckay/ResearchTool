"use client";
import { X, Volume2, Sparkles } from "lucide-react";
import type { Paper } from "@/types/paper";

interface Props {
  paper: Paper | null;
  summary: string | null;
  loading: boolean;
  error: string | null;
  notConfigured: boolean;
  onClose: () => void;
  onReadAloud: (text: string) => void;
}

export function SummaryDialog({
  paper,
  summary,
  loading,
  error,
  notConfigured,
  onClose,
  onReadAloud,
}: Props) {
  if (!paper) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/70 z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Plain language summary of ${paper.title}`}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="bg-[#1e293b] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl">
          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-2 pr-4">
              <Sparkles className="w-4 h-4 text-accent-green shrink-0" />
              <h2 className="font-serif text-base font-bold text-foreground leading-snug">
                {paper.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              aria-label="Close summary"
              className="text-muted hover:text-foreground transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            {loading && (
              <div role="status" aria-label="Generating summary" className="text-center py-8">
                <div className="w-8 h-8 border-2 border-accent/20 border-t-accent rounded-full mx-auto mb-3 animate-spin" />
                <p className="text-subtle text-sm">Generating plain language summary…</p>
              </div>
            )}

            {notConfigured && !loading && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                <p className="text-amber-300 text-sm font-semibold mb-1">API key not configured yet</p>
                <p className="text-subtle text-sm">
                  Add your <code className="text-accent">ANTHROPIC_API_KEY</code> to{" "}
                  <code className="text-accent">.env.local</code> to enable AI summarization.
                  Everything else works without it.
                </p>
              </div>
            )}

            {error && !notConfigured && !loading && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {summary && !loading && (
              <>
                <p
                  aria-live="polite"
                  className="text-foreground text-base leading-relaxed mb-4"
                >
                  {summary}
                </p>
                <button
                  onClick={() => onReadAloud(summary)}
                  className="flex items-center gap-2 text-sm text-accent border border-accent/20 hover:bg-accent/10 rounded-lg px-4 py-2 transition-all"
                  aria-label="Read summary aloud"
                >
                  <Volume2 className="w-4 h-4" />
                  Read aloud
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
