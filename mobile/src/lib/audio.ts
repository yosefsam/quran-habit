export type Reciter = {
  id: string;
  name: string;
  baseUrl: string;
};

export const RECITERS: Reciter[] = [
  { id: "Abdul_Basit_Murattal_64kbps", name: "Abdul Basit (Murattal)", baseUrl: "https://everyayah.com/data/Abdul_Basit_Murattal_64kbps" },
  { id: "Alafasy_64kbps", name: "Mishary Alafasy", baseUrl: "https://everyayah.com/data/Alafasy_64kbps" },
  { id: "Husary_64kbps", name: "Al-Husary", baseUrl: "https://everyayah.com/data/Husary_64kbps" },
];

function pad3(n: number): string {
  return String(Math.max(0, Math.floor(n))).padStart(3, "0");
}

export function getAyahAudioUrl(reciter: Reciter, surahNumber: number, ayahNumber: number): string {
  const file = `${pad3(surahNumber)}${pad3(ayahNumber)}.mp3`;
  return `${reciter.baseUrl}/${file}`;
}

