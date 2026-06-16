"use client";

import { useState, useEffect, useCallback } from "react";

// Simple localStorage-based watchlist
const STORAGE_KEY = "meshwork_watchlist";

export function useWatchlist() {
  const [ids, setIds] = useState<bigint[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setIds(JSON.parse(raw).map(BigInt));
    } catch { /* ignore */ }
  }, []);

  const save = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids.map(String)));
  }, [ids]);

  const toggle = useCallback((jobId: bigint) => {
    setIds((prev) => {
      const next = prev.some((id) => id === jobId)
        ? prev.filter((id) => id !== jobId)
        : [...prev, jobId];
      return next;
    });
    // Save after state update
    setTimeout(() => {
      setIds((prev) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(prev.map(String)));
        return prev;
      });
    }, 0);
  }, []);

  const isSaved = useCallback((jobId: bigint) => ids.some((id) => id === jobId), [ids]);

  return { ids, toggle, isSaved, count: ids.length };
}