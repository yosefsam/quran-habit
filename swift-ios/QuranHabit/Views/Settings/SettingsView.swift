import SwiftUI

struct SettingsView: View {
    @ObservedObject var viewModel: SettingsViewModel

    var body: some View {
        NavigationStack {
            Form {
                Section("About") {
                    LabeledContent("Version", value: viewModel.appVersion)
                    LabeledContent("Build", value: viewModel.build)
                }
                Section("Disclaimer") {
                    Button("Hassanat & progress") {
                        viewModel.showDisclaimer = true
                    }
                }
            }
            .navigationTitle("Settings")
            .sheet(isPresented: $viewModel.showDisclaimer) {
                NavigationStack {
                    ScrollView {
                        Text("Hasanat estimates and reading analytics are for motivation only. They are not a substitute for scholarly guidance.")
                            .padding()
                    }
                    .navigationTitle("Disclaimer")
                    .toolbar {
                        ToolbarItem(placement: .confirmationAction) {
                            Button("Done") { viewModel.showDisclaimer = false }
                        }
                    }
                }
            }
        }
    }
}
