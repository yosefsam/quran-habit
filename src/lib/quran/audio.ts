export type Reciter = {
  /** Stable id used in URLs */
  id: string;
  /** Human-friendly name */
  name: string;
  /** Base URL folder for mp3 files */
  baseUrl: string;
  /** Optional bitrate/notes */
  note?: string;
};

// Source: EveryAyah-style dataset folders (public, widely used).
// Example pattern: `${baseUrl}/001001.mp3`
export const RECITERS: Reciter[] = [
  {
    id: "Abdul_Basit_Murattal_64kbps",
    name: "Abdul Basit (Murattal)",
    baseUrl: "https://everyayah.com/data/Abdul_Basit_Murattal_64kbps",
    note: "64kbps",
  },
  {
    id: "Alafasy_64kbps",
    name: "Mishary Alafasy",
    baseUrl: "https://everyayah.com/data/Alafasy_64kbps",
    note: "64kbps",
  },
  {
    id: "Husary_64kbps",
    name: "Al-Husary",
    baseUrl: "https://everyayah.com/data/Husary_64kbps",
    note: "64kbps",
  },
];

export function pad3(n: number): string {
  const s = String(Math.max(0, Math.floor(n)));
  return s.padStart(3, "0");
}

export function getAyahAudioUrl(reciter: Reciter, surahNumber: number, ayahNumber: number): string {
  // EveryAyah naming convention: SSSAAA.mp3 (3-digit surah, 3-digit ayah)
  const file = `${pad3(surahNumber)}${pad3(ayahNumber)}.mp3`;
  return `${reciter.baseUrl}/${file}`;
}

