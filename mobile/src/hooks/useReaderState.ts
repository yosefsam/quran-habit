import { useEffect, useMemo, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { clampPage, getPage, MUSHAF_PAGE_COUNT } from "../lib/quranData";
import type { Bookmark, QuranPage } from "../types";
import { getHasanatForPages } from "../lib/hasanat";

const KEY_LAST_READ = "reader_last_read_v1";
const KEY_BOOKMARKS = "reader_bookmarks_v1";
const KEY_VISITED = "reader_pages_visited_v1";
const KEY_COMPLETED = "reader_pages_completed_v1";
const KEY_HASANAT_TOTAL = "reader_hasanat_total_v1";

function nowIso() {
  return new Date().toISOString();
}

export function useReaderState() {
  const [page, setPage] = useState(1);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [totalHasanat, setTotalHasanat] = useState(0);
  const visitedRef = useRef<Set<number>>(new Set());
  const completedRef = useRef<Set<number>>(new Set());
  const awardedRef = useRef<Set<number>>(new Set());
  const lastPageRef = useRef<number>(1);

  const pageData: QuranPage = useMemo(() => getPage(page), [page]);

  useEffect(() => {
    (async () => {
      const last = await AsyncStorage.getItem(KEY_LAST_READ);
      if (last) {
        try {
          const parsed = JSON.parse(last);
          const p = clampPage(parsed?.page ?? 1);
          setPage(p);
          lastPageRef.current = p;
        } catch {}
      }
      const bm = await AsyncStorage.getItem(KEY_BOOKMARKS);
      if (bm) {
        try {
          setBookmarks(JSON.parse(bm));
        } catch {}
      }
      const visited = await AsyncStorage.getItem(KEY_VISITED);
      if (visited) {
        try {
          visitedRef.current = new Set(JSON.parse(visited));
        } catch {}
      }
      const completed = await AsyncStorage.getItem(KEY_COMPLETED);
      if (completed) {
        try {
          completedRef.current = new Set(JSON.parse(completed));
        } catch {}
      }
      const total = await AsyncStorage.getItem(KEY_HASANAT_TOTAL);
      if (total) setTotalHasanat(parseInt(total, 10) || 0);

      // mark initial visited
      markVisited(lastPageRef.current);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(KEY_LAST_READ, JSON.stringify({ page, updatedAt: nowIso() })).catch(() => {});
  }, [page]);

  function markVisited(p: number) {
    visitedRef.current.add(p);
    AsyncStorage.setItem(KEY_VISITED, JSON.stringify(Array.from(visitedRef.current))).catch(() => {});
  }

  function markCompleted(p: number) {
    completedRef.current.add(p);
    AsyncStorage.setItem(KEY_COMPLETED, JSON.stringify(Array.from(completedRef.current))).catch(() => {});
  }

  function toggleBookmark(p: number) {
    setBookmarks((prev) => {
      const exists = prev.some((b) => b.page === p);
      const next = exists ? prev.filter((b) => b.page !== p) : [{ id: `bm-${Date.now()}`, page: p, createdAt: nowIso() }, ...prev];
      AsyncStorage.setItem(KEY_BOOKMARKS, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }

  function setPageWithoutReward(p: number) {
    const next = clampPage(p);
    setPage(next);
    markVisited(next);
    lastPageRef.current = next;
  }

  function flipTo(p: number) {
    const next = clampPage(p);
    const prev = lastPageRef.current;
    if (next > prev) {
      // completed page is the one you left
      markCompleted(prev);
      // award per destination page once
      let earned = 0;
      for (let pp = prev + 1; pp <= next; pp++) {
        if (awardedRef.current.has(pp)) continue;
        awardedRef.current.add(pp);
        earned += getHasanatForPages(1);
      }
      if (earned > 0) {
        setTotalHasanat((t) => {
          const nt = t + earned;
          AsyncStorage.setItem(KEY_HASANAT_TOTAL, String(nt)).catch(() => {});
          return nt;
        });
      }
    }
    setPage(next);
    markVisited(next);
    lastPageRef.current = next;
    return next;
  }

  function nextPage() {
    return flipTo(Math.min(MUSHAF_PAGE_COUNT, page + 1));
  }
  function prevPage() {
    return flipTo(Math.max(1, page - 1));
  }

  return {
    page,
    pageData,
    bookmarks,
    isBookmarked: bookmarks.some((b) => b.page === page),
    toggleBookmark,
    totalHasanat,
    visitedPagesCount: visitedRef.current.size,
    completedPagesCount: completedRef.current.size,
    nextPage,
    prevPage,
    setPageWithoutReward,
  };
}

