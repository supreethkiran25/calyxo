import SwiftUI

struct HydrationTrackingView: View {
    @State private var waterIntake: Int = 1750
    let waterGoal: Int = 3000

    var body: some View {
        VStack(spacing: 6) {
            HStack {
                Image(systemName: "drop.fill")
                    .foregroundColor(.blue)
                Text("HYDRATION")
                    .font(.system(size: 11, weight: .black))
                    .foregroundColor(.blue)
                Spacer()
            }

            Text("\(waterIntake) ml")
                .font(.system(size: 24, weight: .black, design: .rounded))
                .foregroundColor(.white)

            ProgressView(value: Double(waterIntake), total: Double(waterGoal))
                .tint(.blue)

            HStack(spacing: 8) {
                Button("+250ml") {
                    waterIntake += 250
                    WKInterfaceDevice.current().play(.click)
                }
                .font(.system(size: 11, weight: .bold))
                .background(Color.blue.opacity(0.3))
                .cornerRadius(8)

                Button("+500ml") {
                    waterIntake += 500
                    WKInterfaceDevice.current().play(.click)
                }
                .font(.system(size: 11, weight: .bold))
                .background(Color.blue.opacity(0.3))
                .cornerRadius(8)
            }
        }
        .padding()
    }
}

struct HeartRateView: View {
    @State private var currentBpm: Int = 74

    var body: some View {
        VStack(spacing: 8) {
            HStack {
                Image(systemName: "heart.fill")
                    .foregroundColor(.red)
                Text("HEART RATE")
                    .font(.system(size: 11, weight: .black))
                    .foregroundColor(.red)
                Spacer()
            }

            Spacer()

            Text("\(currentBpm)")
                .font(.system(size: 38, weight: .black, design: .rounded))
                .foregroundColor(.white)

            Text("BPM CURRENT")
                .font(.system(size: 10, weight: .bold))
                .foregroundColor(.gray)

            Spacer()
        }
        .padding()
    }
}
