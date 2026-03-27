import SwiftUI

struct HassanatBadge: View {
    let ayahsInSession: Int
    let estimate: Int

    var body: some View {
        VStack(alignment: .trailing, spacing: 2) {
            Text("Session")
                .font(.caption2)
                .foregroundStyle(.secondary)
            Text("\(HassanatEstimator.formatted(estimate))")
                .font(.caption.monospacedDigit().weight(.semibold))
                .foregroundStyle(.tint)
            Text("\(ayahsInSession) ayahs")
                .font(.caption2)
                .foregroundStyle(.secondary)
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 8)
        .background(Color(.secondarySystemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 10))
        .accessibilityElement(children: .combine)
        .accessibilityLabel("Estimated hasanat this session")
    }
}
