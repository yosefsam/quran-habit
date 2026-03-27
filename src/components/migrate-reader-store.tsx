"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import {
  clearLegacyReaderStorage,
  LEGACY_STORAGE_COMPLETED,
  LEGACY_STORAGE_VISITED,
  loadLegacyPageSet,
} from "@/lib/reader-storage-legacy";

/** One-time migration from legacy localStorage keys into Zustand (after persist rehydration). */
export function MigrateReaderStore() {
  useEffect(() => {
    function migrate() {
      const st = useAppStore.getState();
      if (st.visitedPages.length > 0 || st.completedPages.length > 0) return;
      const lv = loadLegacyPageSet(LEGACY_STORAGE_VISITED);
      const lc = loadLegacyPageSet(LEGACY_STORAGE_COMPLETED);
      if (lv.size || lc.size) {
        st.setVisitedPages(Array.from(lv));
        st.setCompletedPages(Array.from(lc));
        clearLegacyReaderStorage();
      }
    }
    if (useAppStore.persist.hasHydrated()) migrate();
    else return useAppStore.persist.onFinishHydration(migrate);
  }, []);

  return null;
}
