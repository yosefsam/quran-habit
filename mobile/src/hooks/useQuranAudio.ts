import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
} from "expo-audio";
import type { QuranAyah } from "../types";
import { getAyahAudioUrl, RECITERS, type Reciter } from "../lib/audio";

export type AyahRef = Pick<QuranAyah, "surahNumber" | "ayahNumber" | "surahNameEnglish" | "surahNameArabic" | "text">;

function keyOf(a: AyahRef) {
  return `${a.surahNumber}:${a.ayahNumber}`;
}

function fmt(t: number) {
  const s = Math.max(0, Math.floor(t || 0));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

export function useQuranAudio() {
  const player = useAudioPlayer(null, { updateInterval: 250 });
  const status = useAudioPlayerStatus(player);

  const queueRef = useRef<AyahRef[]>([]);
  const idxRef = useRef(-1);
  const reciterRef = useRef<Reciter>(RECITERS[0]);
  const handledFinishRef = useRef(false);

  const [reciterId, setReciterId] = useState(RECITERS[0]?.id ?? "");

  const reciter: Reciter = useMemo(() => RECITERS.find((r) => r.id === reciterId) ?? RECITERS[0], [reciterId]);

  useEffect(() => {
    reciterRef.current = reciter;
  }, [reciter]);

  const [currentAyah, setCurrentAyah] = useState<AyahRef | null>(null);
  const [positionMillis, setPositionMillis] = useState(0);
  const [durationMillis, setDurationMillis] = useState(0);

  const isPlaying = status.isLoaded ? status.playing : false;

  const currentKey = useMemo(() => (currentAyah ? keyOf(currentAyah) : null), [currentAyah]);

  useEffect(() => {
    if (!status.isLoaded) {
      setPositionMillis(0);
      setDurationMillis(0);
      return;
    }
    setPositionMillis(Math.round((status.currentTime ?? 0) * 1000));
    setDurationMillis(Math.round((status.duration ?? 0) * 1000));
  }, [status]);

  // Advance queue when a track finishes (detect edge on didJustFinish).
  useEffect(() => {
    if (!status.isLoaded || !status.didJustFinish) {
      handledFinishRef.current = false;
      return;
    }
    if (handledFinishRef.current) return;
    handledFinishRef.current = true;

    const q = queueRef.current;
    const nextIdx = idxRef.current + 1;
    if (q.length && nextIdx < q.length) {
      idxRef.current = nextIdx;
      const next = q[nextIdx];
      const uri = getAyahAudioUrl(reciterRef.current, next.surahNumber, next.ayahNumber);
      player.replace({ uri });
      player.play();
      setCurrentAyah(next);
    }
  }, [status.didJustFinish, status.isLoaded, player]);

  const loadAndPlay = useCallback(
    (a: AyahRef, autoplay: boolean) => {
      const uri = getAyahAudioUrl(reciter, a.surahNumber, a.ayahNumber);
      handledFinishRef.current = false;
      player.replace({ uri });
      setCurrentAyah(a);
      if (autoplay) {
        player.play();
      } else {
        player.pause();
      }
    },
    [player, reciter]
  );

  const playAyah = useCallback(
    async (a: AyahRef, internalAutoplay = true) => {
      queueRef.current = [a];
      idxRef.current = 0;
      loadAndPlay(a, internalAutoplay);
    },
    [loadAndPlay]
  );

  const playPage = useCallback(
    async (ayahs: QuranAyah[]) => {
      const q: AyahRef[] = ayahs.map((x) => ({ ...x }));
      if (!q.length) return;
      queueRef.current = q;
      idxRef.current = 0;
      loadAndPlay(q[0], true);
    },
    [loadAndPlay]
  );

  const toggle = useCallback(async () => {
    if (!status.isLoaded) return;
    if (status.playing) {
      player.pause();
    } else {
      player.play();
    }
  }, [player, status.isLoaded, status.playing]);

  const next = useCallback(async () => {
    const q = queueRef.current;
    if (!q.length) return;
    const nextIdx = Math.min(q.length - 1, idxRef.current + 1);
    idxRef.current = nextIdx;
    loadAndPlay(q[nextIdx], true);
  }, [loadAndPlay]);

  const prev = useCallback(async () => {
    const q = queueRef.current;
    if (!q.length) return;
    const prevIdx = Math.max(0, idxRef.current - 1);
    idxRef.current = prevIdx;
    loadAndPlay(q[prevIdx], true);
  }, [loadAndPlay]);

  const seek = useCallback(
    async (millis: number) => {
      if (!status.isLoaded) return;
      const dur = Math.round((status.duration ?? 0) * 1000);
      const t = Math.max(0, Math.min(dur || millis, millis)) / 1000;
      await player.seekTo(t);
    },
    [player, status.duration, status.isLoaded]
  );

  // If reciter changes, reload current ayah.
  useEffect(() => {
    if (!currentAyah) return;
    loadAndPlay(currentAyah, status.playing);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reciterId]);

  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
  }, []);

  return {
    RECITERS,
    reciterId,
    setReciterId,
    reciter,
    isPlaying,
    currentAyah,
    currentKey,
    positionMillis,
    durationMillis,
    formattedTime: fmt(positionMillis / 1000),
    formattedDuration: fmt(durationMillis / 1000),
    playAyah,
    playPage,
    toggle,
    next,
    prev,
    seek,
  };
}
