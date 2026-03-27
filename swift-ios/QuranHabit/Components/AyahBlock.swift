import SwiftUI

struct AyahBlock: View {
    let ayah: QuranAyah

    var body: some View {
        VStack(alignment: .trailing, spacing: 6) {
            Text(ayah.text)
                .font(.system(size: 22, weight: .regular, design: .default))
                .foregroundStyle(.primary)
                .multilineTextAlignment(.trailing)
                .lineSpacing(6)
            Text("﴿\(ayah.ayahNumber)﴾")
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .trailing)
        .padding(.vertical, 4)
    }
}
