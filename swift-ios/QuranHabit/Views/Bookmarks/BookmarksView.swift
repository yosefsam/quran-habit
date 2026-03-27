import SwiftUI

struct BookmarksView: View {
    @ObservedObject var viewModel: BookmarksViewModel

    var body: some View {
        NavigationStack {
            ScrollView {
                LazyVStack(spacing: 12) {
                    ForEach(viewModel.items) { item in
                        HStack {
                            VStack(alignment: .leading, spacing: 4) {
                                Text(viewModel.title(for: item.page))
                                    .font(.headline)
                                Text(item.createdAt.formatted(date: .abbreviated, time: .shortened))
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }
                            Spacer()
                            Button(role: .destructive) {
                                viewModel.remove(item)
                            } label: {
                                Image(systemName: "trash")
                            }
                        }
                        .padding()
                        .background(Color(.secondarySystemBackground))
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                    }
                }
                .padding()
            }
            .navigationTitle("Bookmarks")
            .onAppear { viewModel.refresh() }
            .overlay {
                if viewModel.items.isEmpty {
                    ContentUnavailableView("No bookmarks", systemImage: "bookmark")
                }
            }
        }
    }
}
