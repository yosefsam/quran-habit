import SwiftUI

struct JumpNavigationSheet: View {
    @ObservedObject var viewModel: ReaderViewModel
    let quran: QuranDataProviding
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            Form {
                Section("By page") {
                    TextField("Page number", text: $viewModel.jumpPageField)
                        .keyboardType(.numberPad)
                    Button("Go to page") {
                        viewModel.applyJump()
                    }
                }

                Section("By surah") {
                    Picker("Surah", selection: $viewModel.jumpSurah) {
                        ForEach(quran.surahs(), id: \.number) { s in
                            Text("\(s.number). \(s.nameEnglish)").tag(s.number)
                        }
                    }
                    Button("Go to surah start") {
                        viewModel.applyJump()
                    }
                }

                Section("By juz") {
                    Picker("Juz", selection: $viewModel.jumpJuz) {
                        ForEach(1...30, id: \.self) { j in
                            Text("Juz \(j)").tag(j)
                        }
                    }
                    Button("Go to juz start") {
                        viewModel.applyJuzJump()
                    }
                }

                Section("By ayah") {
                    TextField("e.g. 2:255", text: $viewModel.jumpAyahRef)
                        .textInputAutocapitalization(.never)
                    Button("Go to ayah") {
                        viewModel.applyAyahJump()
                    }
                }
            }
            .navigationTitle("Jump")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Close") { dismiss() }
                }
            }
        }
    }
}
