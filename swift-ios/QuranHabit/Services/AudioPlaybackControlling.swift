import Foundation

/// Hook for future `AVPlayer`-based ayah audio. Wire a real implementation when you add streaming URLs.
protocol AudioPlaybackControlling: AnyObject {
    var isPlaying: Bool { get }
    func playAyah(surah: Int, ayah: Int)
    func pause()
    func stop()
}

final class AudioPlaybackPlaceholder: AudioPlaybackControlling {
    private(set) var isPlaying: Bool = false

    func playAyah(surah: Int, ayah: Int) {
        isPlaying = true
    }

    func pause() {
        isPlaying = false
    }

    func stop() {
        isPlaying = false
    }
}
