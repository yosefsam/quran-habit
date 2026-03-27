import SwiftUI

struct HomeView: View {
    @ObservedObject var viewModel: HomeViewModel

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    Text(viewModel.greeting)
                        .font(.largeTitle.bold())
                    Text("Continue your Quran habit")
                        .foregroundStyle(.secondary)

                    if let p = viewModel.lastReadPage {
                        Label("Resume on Read tab — page \(p)", systemImage: "book.fill")
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding()
                            .background(.ultraThinMaterial)
                            .clipShape(RoundedRectangle(cornerRadius: 14))
                    }

                    VStack(alignment: .leading, spacing: 8) {
                        Text("Reading overview")
                            .font(.headline)
                        Text(viewModel.visitedSummary)
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding()
                    .background(Color(.secondarySystemBackground))
                    .clipShape(RoundedRectangle(cornerRadius: 14))
                }
                .padding()
            }
            .navigationTitle("Home")
            .onAppear { viewModel.refresh() }
        }
    }
}
