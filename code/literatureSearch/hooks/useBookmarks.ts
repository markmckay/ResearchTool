"use client";
import { useState, useEffect } from "react";
import type { Paper } from "@/types/paper";
import {
  createWorkspacePaper,
  mergePaperIntoWorkspacePaper,
  migrateWorkspacePaper,
  normalizeTags,
} from "@/lib/workspace";
import type { WorkspacePaper, WorkspaceStatus } from "@/types/workspace";

const STORAGE_KEY = "literature-search-bookmarks";

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<WorkspacePaper[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;

      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) return;

      const migrated = parsed
        .map((item) => migrateWorkspacePaper(item))
        .filter((item): item is WorkspacePaper => item !== null);

      setBookmarks(migrated);

      if (JSON.stringify(parsed) !== JSON.stringify(migrated)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      }
    } catch {}
  }, []);

  const save = (papers: WorkspacePaper[]) => {
    setBookmarks(papers);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(papers));
    } catch {}
  };

  const addBookmark = (paper: Paper) => {
    const existing = bookmarks.find((bookmark) => bookmark.id === paper.id);
    if (!existing) {
      save([...bookmarks, createWorkspacePaper(paper)]);
      return;
    }

    save(
      bookmarks.map((bookmark) =>
        bookmark.id === paper.id ? mergePaperIntoWorkspacePaper(bookmark, paper) : bookmark
      )
    );
  };

  const saveWorkspacePaper = (paper: Paper, status: WorkspaceStatus) => {
    const existing = bookmarks.find((bookmark) => bookmark.id === paper.id);
    if (!existing) {
      save([...bookmarks, { ...createWorkspacePaper(paper), status }]);
      return;
    }

    save(
      bookmarks.map((bookmark) =>
        bookmark.id === paper.id
          ? {
              ...mergePaperIntoWorkspacePaper(bookmark, paper),
              status,
              exclusionReason: status === "Excluded" ? bookmark.exclusionReason : "",
            }
          : bookmark
      )
    );
  };

  const removeBookmark = (id: string) => {
    save(bookmarks.filter((b) => b.id !== id));
  };

  const isBookmarked = (id: string) => bookmarks.some((b) => b.id === id);

  const updateBookmarkStatus = (id: string, status: WorkspaceStatus) => {
    save(
      bookmarks.map((bookmark) =>
        bookmark.id === id
          ? {
              ...bookmark,
              status,
              exclusionReason: status === "Excluded" ? bookmark.exclusionReason : "",
              updatedAt: new Date().toISOString(),
            }
          : bookmark
      )
    );
  };

  const updateBookmarkTags = (id: string, tags: string[]) => {
    save(
      bookmarks.map((bookmark) =>
        bookmark.id === id
          ? {
              ...bookmark,
              tags: normalizeTags(tags),
              updatedAt: new Date().toISOString(),
            }
          : bookmark
      )
    );
  };

  const updateBookmarkNotes = (id: string, notes: string) => {
    save(
      bookmarks.map((bookmark) =>
        bookmark.id === id
          ? { ...bookmark, notes, updatedAt: new Date().toISOString() }
          : bookmark
      )
    );
  };

  const updateBookmarkExclusionReason = (id: string, exclusionReason: string) => {
    save(
      bookmarks.map((bookmark) =>
        bookmark.id === id
          ? { ...bookmark, exclusionReason, updatedAt: new Date().toISOString() }
          : bookmark
      )
    );
  };

  return {
    bookmarks,
    addBookmark,
    saveWorkspacePaper,
    removeBookmark,
    isBookmarked,
    updateBookmarkStatus,
    updateBookmarkTags,
    updateBookmarkNotes,
    updateBookmarkExclusionReason,
  };
}
