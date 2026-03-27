import Foundation

@MainActor
final class SettingsViewModel: ObservableObject {
    @Published var showDisclaimer: Bool = false

    let appVersion: String = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0"
    let build: String = Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? "1"
}
