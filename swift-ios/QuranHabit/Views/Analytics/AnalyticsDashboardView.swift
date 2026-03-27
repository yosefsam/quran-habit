import SwiftUI

struct AnalyticsDashboardView: View {
    @ObservedObject var viewModel: AnalyticsViewModel

    var body: some View {
        NavigationStack {
            List {
                Section("Overview") {
                    LabeledContent("Pages visited", value: "\(viewModel.visitedCount) / \(viewModel.totalPages)")
                    LabeledContent("Pages marked done", value: "\(viewModel.completedCount)")
                }
                Section("Last read") {
                    Text(viewModel.lastReadText)
                }
                Section {
                    Text("Estimates are illustrative — not a religious ruling.")
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                }
            }
            .navigationTitle("Progress")
            .onAppear { viewModel.refresh() }
        }
    }
}
