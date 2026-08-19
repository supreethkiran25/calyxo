import SwiftUI
import HealthKit

struct WorkoutTrackingView: View {
    @State private var isRunning: Bool = false
    @State private var elapsedSeconds: Int = 0
    @State private var heartRate: Int = 118
    @State private var caloriesBurned: Int = 0
    @State private var timer: Timer?

    var body: some View {
        VStack(spacing: 8) {
            HStack {
                Circle()
                    .fill(isRunning ? Color.green : Color.orange)
                    .frame(width: 8, height: 8)
                Text(isRunning ? "LIVE WORKOUT" : "READY")
                    .font(.system(size: 11, weight: .black))
                    .foregroundColor(isRunning ? .green : .orange)
                Spacer()
            }

            Text(formatTime(elapsedSeconds))
                .font(.system(size: 28, weight: .black, design: .monospaced))
                .foregroundColor(.white)

            HStack(spacing: 12) {
                VStack {
                    Text("\(heartRate)")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(.red)
                    Text("BPM")
                        .font(.system(size: 9))
                        .foregroundColor(.gray)
                }

                VStack {
                    Text("\(caloriesBurned)")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(.orange)
                    Text("KCAL")
                        .font(.system(size: 9))
                        .foregroundColor(.gray)
                }
            }

            Spacer()

            HStack(spacing: 8) {
                Button(action: toggleWorkout) {
                    Image(systemName: isRunning ? "pause.fill" : "play.fill")
                        .foregroundColor(.black)
                        .padding(8)
                        .background(Color(red: 16/255, green: 185/255, blue: 129/255))
                        .clipShape(Circle())
                }

                if isRunning {
                    Button(action: stopWorkout) {
                        Image(systemName: "stop.fill")
                            .foregroundColor(.white)
                            .padding(8)
                            .background(Color.red)
                            .clipShape(Circle())
                    }
                }
            }
        }
        .padding()
    }

    private func toggleWorkout() {
        isRunning.toggle()
        if isRunning {
            startTimer()
        } else {
            timer?.invalidate()
        }
    }

    private func stopWorkout() {
        isRunning = false
        timer?.invalidate()
        elapsedSeconds = 0
        caloriesBurned = 0
    }

    private func startTimer() {
        timer?.invalidate()
        timer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { _ in
            elapsedSeconds += 1
            if elapsedSeconds % 10 == 0 {
                caloriesBurned += 1
            }
        }
    }

    private func formatTime(_ sec: Int) -> String {
        let m = sec / 60
        let s = sec % 60
        return String(format: "%02d:%02d", m, s)
    }
}
