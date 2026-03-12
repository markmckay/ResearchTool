"use client";
import { useState, useEffect } from "react";
import type { Paper } from "@/types/paper";

const STORAGE_KEY = "literature-search-bookmarks";

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Paper[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setBookmarks(JSON.parse(stored));
    } catch {}
  }, []);

  const save = (papers: Paper[]) => {
    setBookmarks(papers);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(papers));
    } catch {}
  };

  const addBookmark = (paper: Paper) => {
    if (bookmarks.find((b) => b.id === paper.id)) return;
    save([...bookmarks, paper]);
  };

  const removeBookmark = (id: string) => {
    save(bookmarks.filter((b) => b.id !== id));
  };

  const isBookmarked = (id: string) => bookmarks.some((b) => b.id === id);

  return { bookmarks, addBookmark, removeBookmark, isBookmarked };
}
