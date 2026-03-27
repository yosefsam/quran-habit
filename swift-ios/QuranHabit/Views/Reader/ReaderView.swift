import SwiftUI

struct ReaderView: View {
    @ObservedObject var viewModel: ReaderViewModel
    let quran: QuranDataProviding

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                readerHeader
                Divider()
                pageScroll
                Divider()
                readerToolbar
            }
            .navigationTitle("Reader")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        viewModel.showJumpSheet = true
                    } label: {
                        Image(systemName: "arrow.up.left.and.arrow.down.right.magnifyingglass")
                    }
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        viewModel.toggleBookmark()
                    } label: {
                        Image(systemName: viewModel.isBookmarked ? "bookmark.fill" : "bookmark")
                    }
                }
            }
            .onAppear {
                viewModel.load(page: viewModel.currentPage, countSession: false)
            }
            .sheet(isPresented: $viewModel.showJumpSheet) {
                JumpNavigationSheet(viewModel: viewModel, quran: quran)
            }
        }
    }

    private var readerHeader: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                if let page = viewModel.currentPageContent {
                    Text("\(page.surahNameEnglish) · Juz \(page.juz)")
                        .font(.subheadline.weight(.semibold))
                    Text("Page \(viewModel.currentPage) / \(quran.pageCount)")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                } else {
                    Text("Page \(viewModel.currentPage)")
                        .font(.subheadline.weight(.semibold))
                }
            }
            Spacer()
            HassanatBadge(ayahsInSession: viewModel.sessionAyahsRead, estimate: viewModel.sessionHassanatEstimate)
        }
        .padding(.horizontal)
        .padding(.vertical, 10)
        .background(Color(.systemBackground))
    }

    private var pageScroll: some View {
        ScrollView {
            if let page = viewModel.currentPageContent {
                LazyVStack(alignment: .trailing, spacing: 12) {
                    ForEach(page.ayahs) { ayah in
                        AyahBlock(ayah: ayah)
                    }
                }
                .padding()
                .frame(maxWidth: .infinity, alignment: .trailing)
            } else {
                ContentUnavailableView(
                    "No text for this page",
                    systemImage: "doc.text",
                    description: Text("Add full mushaf JSON to the bundle and swap `MockQuranDataService`.")
                )
                .padding(.top, 40)
            }
        }
        .environment(\.layoutDirection, .rightToLeft)
    }

    private var readerToolbar: some View {
        HStack(spacing: 24) {
            Button { viewModel.previousPage() } label: {
                Label("Previous", systemImage: "chevron.backward.circle.fill")
            }
            .disabled(viewModel.currentPage <= 1)

            Button { viewModel.markPageCompleted() } label: {
                Label("Done", systemImage: "checkmark.circle")
            }
            .labelStyle(.iconOnly)

            Button("Audio") { }
                .disabled(true)
                .help("Wire `AudioPlaybackControlling` + URL scheme later")

            Button { viewModel.nextPage() } label: {
                Label("Next", systemImage: "chevron.forward.circle.fill")
            }
            .disabled(viewModel.currentPage >= quran.pageCount)
        }
        .padding(.vertical, 12)
        .padding(.horizontal)
        .background(.ultraThinMaterial)
    }
}
