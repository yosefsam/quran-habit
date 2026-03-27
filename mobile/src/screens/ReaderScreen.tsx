import React, { useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useReaderState } from "../hooks/useReaderState";
import { formatHasanat } from "../lib/hasanat";
import { MUSHAF_PAGE_COUNT, QURAN_SURAHS, clampPage, findPageForAyah, findSurahStartPage, getFirstPageOfJuz } from "../lib/quranData";
import { useQuranAudio } from "../hooks/useQuranAudio";

function arabicIndic(n: number) {
  return String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[parseInt(d, 10)] ?? d);
}

export default function ReaderScreen() {
  const reader = useReaderState();
  const audio = useQuranAudio();

  const scrollRef = useRef<ScrollView | null>(null);

  const [navOpen, setNavOpen] = useState(false);
  const [surahSearch, setSurahSearch] = useState("");
  const [selectedSurah, setSelectedSurah] = useState(reader.pageData?.surahNumber ?? 1);
  const [selectedAyah, setSelectedAyah] = useState("");
  const [pageInput, setPageInput] = useState(String(reader.page));
  const [juzInput, setJuzInput] = useState(String(reader.pageData?.juz ?? 1));
  const [directInput, setDirectInput] = useState("");
  const [highlightKey, setHighlightKey] = useState<string | null>(null);

  const page = reader.pageData;
  const headerTitle = `${page.surahNameEnglish} · Juz ${page.juz}`;

  const filteredSurahs = useMemo(() => {
    const q = surahSearch.trim().toLowerCase();
    if (!q) return QURAN_SURAHS.surahs;
    return QURAN_SURAHS.surahs.filter((s) => `${s.number} ${s.nameEnglish} ${s.nameArabic}`.toLowerCase().includes(q));
  }, [surahSearch]);

  function jump() {
    const direct = directInput.trim();
    if (direct) {
      const m = direct.match(/^(\d{1,3})\s*[:\s]\s*(\d{1,4})$/);
      if (m) {
        const s = parseInt(m[1], 10);
        const a = parseInt(m[2], 10);
        const p = findPageForAyah(s, a);
        reader.setPageWithoutReward(p);
        setHighlightKey(`${s}:${a}`);
        setNavOpen(false);
        return;
      }
      const p = clampPage(parseInt(direct, 10));
      reader.setPageWithoutReward(p);
      setHighlightKey(null);
      setNavOpen(false);
      return;
    }

    // Surah (+ optional ayah)
    if (selectedSurah) {
      const ay = selectedAyah.trim() ? parseInt(selectedAyah, 10) : null;
      if (ay) {
        const p = findPageForAyah(selectedSurah, ay);
        reader.setPageWithoutReward(p);
        setHighlightKey(`${selectedSurah}:${ay}`);
        setNavOpen(false);
        return;
      }
      const p = findSurahStartPage(selectedSurah);
      reader.setPageWithoutReward(p);
      setHighlightKey(null);
      setNavOpen(false);
      return;
    }

    // Page
    const p = clampPage(parseInt(pageInput, 10));
    reader.setPageWithoutReward(p);
    setHighlightKey(null);
    setNavOpen(false);
    return;
  }

  function jumpPage() {
    const p = clampPage(parseInt(pageInput, 10));
    reader.setPageWithoutReward(p);
    setHighlightKey(null);
    setNavOpen(false);
  }

  function jumpJuz() {
    const j = Math.min(30, Math.max(1, parseInt(juzInput, 10) || 1));
    const p = getFirstPageOfJuz(j);
    reader.setPageWithoutReward(p);
    setHighlightKey(null);
    setNavOpen(false);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["top"]}>
      {/* Header */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#eee", flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Pressable onPress={() => setNavOpen(true)} style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: "600" }} numberOfLines={1}>{headerTitle}</Text>
          <Text style={{ fontSize: 12, color: "#666" }}>Page {reader.page} / {MUSHAF_PAGE_COUNT}</Text>
        </Pressable>

        <Pressable onPress={() => reader.toggleBookmark(reader.page)} style={{ paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10, backgroundColor: reader.isBookmarked ? "#E8FBF4" : "#F4F4F5" }}>
          <Text style={{ fontSize: 12, fontWeight: "600", color: reader.isBookmarked ? "#0F9D74" : "#333" }}>{reader.isBookmarked ? "Bookmarked" : "Bookmark"}</Text>
        </Pressable>
      </View>

      {/* Navigation modal (simple, clean MVP) */}
      {navOpen && (
        <View style={{ position: "absolute", top: 70, left: 16, right: 16, zIndex: 20, borderRadius: 16, borderWidth: 1, borderColor: "#eee", backgroundColor: "#fff", padding: 14, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: "700" }}>Start reading from</Text>

          <Text style={{ marginTop: 12, fontSize: 12, color: "#666" }}>Direct input</Text>
          <TextInput value={directInput} onChangeText={setDirectInput} placeholder="e.g. 2:255 or 18" style={{ borderWidth: 1, borderColor: "#eee", borderRadius: 12, padding: 10, marginTop: 6 }} />

          <Text style={{ marginTop: 12, fontSize: 12, color: "#666" }}>Surah (search)</Text>
          <TextInput value={surahSearch} onChangeText={setSurahSearch} placeholder="Type a surah name…" style={{ borderWidth: 1, borderColor: "#eee", borderRadius: 12, padding: 10, marginTop: 6 }} />

          <ScrollView style={{ maxHeight: 160, marginTop: 8, borderWidth: 1, borderColor: "#eee", borderRadius: 12 }}>
            {filteredSurahs.slice(0, 40).map((s) => (
              <Pressable key={s.number} onPress={() => setSelectedSurah(s.number)} style={{ paddingHorizontal: 12, paddingVertical: 10, backgroundColor: selectedSurah === s.number ? "#E8FBF4" : "#fff" }}>
                <Text style={{ fontSize: 13, fontWeight: "600", color: selectedSurah === s.number ? "#0F9D74" : "#111" }}>
                  {s.number}. {s.nameEnglish} ({s.nameArabic})
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <Text style={{ marginTop: 12, fontSize: 12, color: "#666" }}>Ayah (optional)</Text>
          <TextInput value={selectedAyah} onChangeText={(t) => setSelectedAyah(t.replace(/[^\d]/g, ""))} placeholder="e.g. 1" style={{ borderWidth: 1, borderColor: "#eee", borderRadius: 12, padding: 10, marginTop: 6 }} keyboardType="number-pad" />

          <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, color: "#666" }}>Page</Text>
              <TextInput value={pageInput} onChangeText={(t) => setPageInput(t.replace(/[^\d]/g, ""))} placeholder="1–604" style={{ borderWidth: 1, borderColor: "#eee", borderRadius: 12, padding: 10, marginTop: 6 }} keyboardType="number-pad" />
              <Pressable onPress={jumpPage} style={{ marginTop: 8, borderRadius: 12, padding: 10, backgroundColor: "#F4F4F5" }}>
                <Text style={{ textAlign: "center", fontWeight: "700" }}>Go page</Text>
              </Pressable>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, color: "#666" }}>Juz</Text>
              <TextInput value={juzInput} onChangeText={(t) => setJuzInput(t.replace(/[^\d]/g, ""))} placeholder="1–30" style={{ borderWidth: 1, borderColor: "#eee", borderRadius: 12, padding: 10, marginTop: 6 }} keyboardType="number-pad" />
              <Pressable onPress={jumpJuz} style={{ marginTop: 8, borderRadius: 12, padding: 10, backgroundColor: "#F4F4F5" }}>
                <Text style={{ textAlign: "center", fontWeight: "700" }}>Go juz</Text>
              </Pressable>
            </View>
          </View>

          <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
            <Pressable onPress={() => { reader.setPageWithoutReward(1); setNavOpen(false); }} style={{ flex: 1, borderRadius: 12, padding: 12, backgroundColor: "#F4F4F5" }}>
              <Text style={{ textAlign: "center", fontWeight: "700" }}>First page</Text>
            </Pressable>
            <Pressable onPress={() => { setNavOpen(false); }} style={{ flex: 1, borderRadius: 12, padding: 12, backgroundColor: "#111" }}>
              <Text style={{ textAlign: "center", fontWeight: "700", color: "#fff" }}>Close</Text>
            </Pressable>
          </View>

          <Pressable onPress={jump} style={{ marginTop: 10, borderRadius: 12, padding: 14, backgroundColor: "#0F9D74" }}>
            <Text style={{ textAlign: "center", fontWeight: "800", color: "#fff" }}>Go to reading position</Text>
          </Pressable>

          <Text style={{ marginTop: 10, fontSize: 11, color: "#666" }}>
            Tip: use “2:255” to jump to a specific ayah. The target ayah will highlight briefly.
          </Text>
        </View>
      )}

      {/* Reading canvas */}
      <ScrollView ref={(r) => { scrollRef.current = r; }} style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 110 }}>
        <View style={{ borderRadius: 18, borderWidth: 1, borderColor: "#eee", backgroundColor: "#fafafa", padding: 16 }}>
          <Text style={{ fontSize: 22, lineHeight: 44, textAlign: "right" }}>
            {page.ayahs.map((a) => {
              const k = `${a.surahNumber}:${a.ayahNumber}`;
              const playing = audio.currentKey === k;
              const highlighted = highlightKey === k;
              return (
                <Text
                  key={k}
                  onPress={() => audio.playAyah(a)}
                  style={{
                    backgroundColor: playing || highlighted ? "rgba(15,157,116,0.10)" : "transparent",
                    borderRadius: 8,
                  }}
                >
                  {a.text}{" "}
                  <Text style={{ color: "#666" }}>﴿{arabicIndic(a.ayahNumber)}﴾</Text>{" "}
                </Text>
              );
            })}
          </Text>
        </View>

        <Text style={{ marginTop: 10, fontSize: 11, color: "#666" }}>
          Hasanat shown here are motivational estimates for reflection and consistency, not a definitive count.
        </Text>
      </ScrollView>

      {/* Sticky controls */}
      <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, borderTopWidth: 1, borderTopColor: "#eee", backgroundColor: "rgba(255,255,255,0.96)" }}>
        <View style={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12, gap: 10 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ fontSize: 12, color: "#666" }}>Hasanat (est.)</Text>
            <Text style={{ fontSize: 14, fontWeight: "800", color: "#0F9D74" }}>{formatHasanat(reader.totalHasanat)}</Text>
          </View>

          <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 10 }}>
            <Pressable onPress={reader.prevPage} style={{ flex: 1, borderRadius: 14, padding: 12, backgroundColor: "#F4F4F5" }}>
              <Text style={{ textAlign: "center", fontWeight: "800" }}>Prev page</Text>
            </Pressable>
            <Pressable onPress={reader.nextPage} style={{ flex: 1, borderRadius: 14, padding: 12, backgroundColor: "#F4F4F5" }}>
              <Text style={{ textAlign: "center", fontWeight: "800" }}>Next page</Text>
            </Pressable>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Pressable onPress={() => audio.playPage(page.ayahs)} style={{ borderRadius: 14, paddingVertical: 10, paddingHorizontal: 12, backgroundColor: "#0F9D74" }}>
              <Text style={{ color: "#fff", fontWeight: "900" }}>Play page</Text>
            </Pressable>
            <Pressable onPress={audio.prev} style={{ borderRadius: 14, paddingVertical: 10, paddingHorizontal: 12, backgroundColor: "#F4F4F5" }}>
              <Text style={{ fontWeight: "900" }}>Prev ayah</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                if (!audio.currentAyah) audio.playPage(page.ayahs);
                else audio.toggle();
              }}
              style={{ borderRadius: 14, paddingVertical: 10, paddingHorizontal: 12, backgroundColor: "#111" }}
            >
              <Text style={{ color: "#fff", fontWeight: "900" }}>{audio.isPlaying ? "Pause" : "Play"}</Text>
            </Pressable>
            <Pressable onPress={audio.next} style={{ borderRadius: 14, paddingVertical: 10, paddingHorizontal: 12, backgroundColor: "#F4F4F5" }}>
              <Text style={{ fontWeight: "900" }}>Next ayah</Text>
            </Pressable>
          </View>

          <Text style={{ fontSize: 11, color: "#666" }} numberOfLines={1}>
            {audio.currentAyah ? `Now playing: ${audio.currentAyah.surahNameEnglish} · Ayah ${audio.currentAyah.ayahNumber}` : "Tap any ayah to play it."}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

