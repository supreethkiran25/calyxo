import WidgetKit
import SwiftUI

// MARK: - Shared Timeline Entry
struct CalyxoWidgetEntry: TimelineEntry {
    let date: Date
    let calories: Int
    let calorieGoal: Int
    let water: Int
    let waterGoal: Int
    let protein: Int
    let proteinGoal: Int
    let carbs: Int
    let fat: Int
    let steps: Int
    let streak: Int
    let activeWorkoutName: String
    let hasData: Bool
}

// MARK: - Modern Container Background Compatibility Modifier
extension View {
    func calyxoWidgetBackground(_ color: Color = Color(red: 10/255, green: 10/255, blue: 12/255)) -> some View {
        if #available(iOS 17.0, *) {
            return AnyView(self.containerBackground(color, for: .widget))
        } else {
            return AnyView(self.background(color))
        }
    }
}

// MARK: - Timeline Provider (Real App Group Data Only)
struct CalyxoWidgetProvider: TimelineProvider {
    func placeholder(in context: Context) -> CalyxoWidgetEntry {
        CalyxoWidgetEntry(
            date: Date(),
            calories: 1188, calorieGoal: 2875,
            water: 2000, waterGoal: 2500,
            protein: 107, proteinGoal: 124,
            carbs: 140, fat: 45, steps: 4200, streak: 5,
            activeWorkoutName: "",
            hasData: true
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (CalyxoWidgetEntry) -> ()) {
        completion(readSharedData())
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<CalyxoWidgetEntry>) -> ()) {
        let entry = readSharedData()
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 15, to: Date()) ?? Date().addingTimeInterval(900)
        completion(Timeline(entries: [entry], policy: .after(nextUpdate)))
    }

    private func readSharedData() -> CalyxoWidgetEntry {
        let suiteName = "group.com.supreethkiran.calyxo"
        let d = UserDefaults(suiteName: suiteName) ?? .standard
        let calories = d.integer(forKey: "widget_calories")
        let calorieGoal = d.integer(forKey: "widget_calorie_goal")
        let water = d.integer(forKey: "widget_water")
        let waterGoal = d.integer(forKey: "widget_water_goal")
        let protein = d.integer(forKey: "widget_protein")
        let proteinGoal = d.integer(forKey: "widget_protein_goal")
        let carbs = d.integer(forKey: "widget_carbs")
        let fat = d.integer(forKey: "widget_fat")
        let steps = d.integer(forKey: "widget_steps")
        let streak = d.integer(forKey: "widget_streak")
        let workout = d.string(forKey: "widget_active_workout") ?? ""

        let hasData = calories > 0 || water > 0 || steps > 0 || streak > 0 || !workout.isEmpty

        return CalyxoWidgetEntry(
            date: Date(),
            calories: calories,
            calorieGoal: calorieGoal > 0 ? calorieGoal : 2000,
            water: water,
            waterGoal: waterGoal > 0 ? waterGoal : 2500,
            protein: protein,
            proteinGoal: proteinGoal > 0 ? proteinGoal : 150,
            carbs: carbs,
            fat: fat,
            steps: steps,
            streak: streak,
            activeWorkoutName: workout,
            hasData: hasData
        )
    }
}

// MARK: - Calyxo Brand Colors
private let calyxoGreen = Color(red: 16/255, green: 185/255, blue: 129/255)
private let calyxoAmber = Color(red: 245/255, green: 158/255, blue: 11/255)
private let calyxoCyan = Color(red: 0/255, green: 242/255, blue: 254/255)
private let calyxoCoral = Color(red: 255/255, green: 78/255, blue: 80/255)
private let calyxoBg = Color(red: 10/255, green: 10/255, blue: 12/255)

// MARK: - Circular Progress Ring Component
struct ProgressRing: View {
    var progress: Double
    var color: Color
    var lineWidth: CGFloat = 6

    var body: some View {
        ZStack {
            Circle()
                .stroke(color.opacity(0.18), lineWidth: lineWidth)
            Circle()
                .trim(from: 0.0, to: CGFloat(min(max(progress, 0.0), 1.0)))
                .stroke(
                    color,
                    style: StrokeStyle(lineWidth: lineWidth, lineCap: .round)
                )
                .rotationEffect(.degrees(-90))
        }
    }
}

// MARK: - 1. THREE RINGS WIDGET VIEW (CALORIES, HYDRATION, PROTEIN)
struct RingsWidgetView: View {
    var entry: CalyxoWidgetEntry
    @Environment(\.widgetFamily) var family

    private var calProgress: Double {
        guard entry.calorieGoal > 0 else { return 0 }
        return Double(entry.calories) / Double(entry.calorieGoal)
    }

    private var waterProgress: Double {
        guard entry.waterGoal > 0 else { return 0 }
        return Double(entry.water) / Double(entry.waterGoal)
    }

    private var protProgress: Double {
        guard entry.proteinGoal > 0 else { return 0 }
        return Double(entry.protein) / Double(entry.proteinGoal)
    }

    var body: some View {
        if family == .systemMedium {
            // Medium Widget: 3 Side-by-Side Rings with exact values & goals matching in-app
            HStack(spacing: 12) {
                // Calories Ring
                VStack(spacing: 4) {
                    ZStack {
                        ProgressRing(progress: calProgress, color: calyxoAmber, lineWidth: 7)
                            .frame(width: 58, height: 58)
                        Text("\(Int(calProgress * 100))%")
                            .font(.system(size: 14, weight: .black, design: .rounded))
                            .foregroundColor(.white)
                    }
                    Text("CALORIES")
                        .font(.system(size: 8, weight: .black))
                        .foregroundColor(calyxoAmber)
                    Text("\(entry.calories)/\(entry.calorieGoal)")
                        .font(.system(size: 8, weight: .bold))
                        .foregroundColor(.gray)
                        .lineLimit(1)
                }
                .frame(maxWidth: .infinity)

                // Hydration Ring
                VStack(spacing: 4) {
                    ZStack {
                        ProgressRing(progress: waterProgress, color: calyxoCyan, lineWidth: 7)
                            .frame(width: 58, height: 58)
                        Text("\(Int(waterProgress * 100))%")
                            .font(.system(size: 14, weight: .black, design: .rounded))
                            .foregroundColor(.white)
                    }
                    Text("HYDRATION")
                        .font(.system(size: 8, weight: .black))
                        .foregroundColor(calyxoCyan)
                    Text("\(entry.water)/\(entry.waterGoal)ml")
                        .font(.system(size: 8, weight: .bold))
                        .foregroundColor(.gray)
                        .lineLimit(1)
                }
                .frame(maxWidth: .infinity)

                // Protein Ring
                VStack(spacing: 4) {
                    ZStack {
                        ProgressRing(progress: protProgress, color: calyxoCoral, lineWidth: 7)
                            .frame(width: 58, height: 58)
                        Text("\(Int(protProgress * 100))%")
                            .font(.system(size: 14, weight: .black, design: .rounded))
                            .foregroundColor(.white)
                    }
                    Text("PROTEIN")
                        .font(.system(size: 8, weight: .black))
                        .foregroundColor(calyxoCoral)
                    Text("\(entry.protein)/\(entry.proteinGoal)g")
                        .font(.system(size: 8, weight: .bold))
                        .foregroundColor(.gray)
                        .lineLimit(1)
                }
                .frame(maxWidth: .infinity)
            }
            .padding(.horizontal, 10)
            .padding(.vertical, 8)
            .calyxoWidgetBackground(calyxoBg)
        } else {
            // Small Widget: Concentric 3 Rings with Calorie Summary
            VStack(alignment: .leading, spacing: 6) {
                HStack {
                    Image(systemName: "flame.fill").foregroundColor(calyxoAmber).font(.system(size: 10))
                    Text("CALYXO RINGS")
                        .font(.system(size: 9, weight: .black))
                        .foregroundColor(.white)
                    Spacer()
                    if entry.streak > 0 {
                        Text("🔥\(entry.streak)d")
                            .font(.system(size: 9, weight: .black))
                            .foregroundColor(.orange)
                    }
                }

                Spacer()

                HStack(spacing: 10) {
                    ZStack {
                        ProgressRing(progress: calProgress, color: calyxoAmber, lineWidth: 5)
                            .frame(width: 54, height: 54)
                        ProgressRing(progress: waterProgress, color: calyxoCyan, lineWidth: 4.5)
                            .frame(width: 40, height: 40)
                        ProgressRing(progress: protProgress, color: calyxoCoral, lineWidth: 4)
                            .frame(width: 27, height: 27)
                    }

                    VStack(alignment: .leading, spacing: 3) {
                        HStack(spacing: 3) {
                            Circle().fill(calyxoAmber).frame(width: 5, height: 5)
                            Text("\(entry.calories) kcal")
                                .font(.system(size: 9, weight: .bold))
                                .foregroundColor(.white)
                        }
                        HStack(spacing: 3) {
                            Circle().fill(calyxoCyan).frame(width: 5, height: 5)
                            Text("\(entry.water) ml")
                                .font(.system(size: 9, weight: .bold))
                                .foregroundColor(.white)
                        }
                        HStack(spacing: 3) {
                            Circle().fill(calyxoCoral).frame(width: 5, height: 5)
                            Text("\(entry.protein)g prot")
                                .font(.system(size: 9, weight: .bold))
                                .foregroundColor(.white)
                        }
                    }
                }
            }
            .padding(12)
            .calyxoWidgetBackground(calyxoBg)
        }
    }
}

struct RingsWidget: Widget {
    let kind = "CalyxoRingsWidget"
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: CalyxoWidgetProvider()) { entry in
            RingsWidgetView(entry: entry)
        }
        .configurationDisplayName("Daily Rings")
        .description("Track Calories, Hydration, and Protein rings with live progress.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

// MARK: - 2. HYDRATION WIDGET VIEW
struct HydrationWidgetView: View {
    var entry: CalyxoWidgetEntry

    private var waterProgress: Double {
        guard entry.waterGoal > 0 else { return 0 }
        return min(Double(entry.water) / Double(entry.waterGoal), 1.0)
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Image(systemName: "drop.fill").foregroundColor(calyxoCyan)
                Text("HYDRATION")
                    .font(.system(size: 10, weight: .black))
                    .foregroundColor(calyxoCyan)
                Spacer()
                if entry.streak > 0 {
                    Text("🔥 \(entry.streak)d")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(.orange)
                }
            }
            Spacer()
            if entry.water > 0 {
                Text("\(entry.water) ml")
                    .font(.system(size: 20, weight: .black, design: .rounded))
                    .foregroundColor(.white)
                ProgressView(value: waterProgress)
                    .tint(calyxoCyan)
                Text("\(max(0, entry.waterGoal - entry.water)) ml remaining")
                    .font(.system(size: 9, weight: .semibold))
                    .foregroundColor(.gray)
            } else {
                Text("0 ml")
                    .font(.system(size: 20, weight: .black, design: .rounded))
                    .foregroundColor(.white)
                ProgressView(value: 0.0)
                    .tint(calyxoCyan)
                Text("Goal: \(entry.waterGoal) ml")
                    .font(.system(size: 9, weight: .semibold))
                    .foregroundColor(.gray)
            }
        }
        .padding(12)
        .calyxoWidgetBackground(calyxoBg)
    }
}

struct HydrationWidget: Widget {
    let kind = "CalyxoHydrationWidget"
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: CalyxoWidgetProvider()) { entry in
            HydrationWidgetView(entry: entry)
        }
        .configurationDisplayName("Hydration Tracker")
        .description("Track daily water consumption and hydration streaks.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

// MARK: - 3. NUTRITION & CALORIE WIDGET VIEW
struct NutritionWidgetView: View {
    var entry: CalyxoWidgetEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Image(systemName: "flame.fill").foregroundColor(calyxoAmber)
                Text("CALORIES")
                    .font(.system(size: 10, weight: .black))
                    .foregroundColor(calyxoAmber)
                Spacer()
            }
            Spacer()
            (Text("\(entry.calories)")
                .font(.system(size: 22, weight: .black, design: .rounded))
                .foregroundColor(.white)
            + Text(" / \(entry.calorieGoal) kcal")
                .font(.system(size: 11, weight: .bold))
                .foregroundColor(.gray))

            HStack(spacing: 8) {
                HStack(spacing: 2) {
                    Circle().fill(calyxoGreen).frame(width: 5, height: 5)
                    Text("\(entry.protein)g P")
                        .font(.system(size: 9, weight: .bold))
                        .foregroundColor(.white)
                }
                HStack(spacing: 2) {
                    Circle().fill(.yellow).frame(width: 5, height: 5)
                    Text("\(entry.carbs)g C")
                        .font(.system(size: 9, weight: .bold))
                        .foregroundColor(.white)
                }
                HStack(spacing: 2) {
                    Circle().fill(calyxoCoral).frame(width: 5, height: 5)
                    Text("\(entry.fat)g F")
                        .font(.system(size: 9, weight: .bold))
                        .foregroundColor(.white)
                }
            }
        }
        .padding(12)
        .calyxoWidgetBackground(calyxoBg)
    }
}

struct NutritionWidget: Widget {
    let kind = "CalyxoNutritionWidget"
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: CalyxoWidgetProvider()) { entry in
            NutritionWidgetView(entry: entry)
        }
        .configurationDisplayName("Daily Nutrition")
        .description("Track daily calories and macronutrient breakdown.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

// MARK: - 4. ACTIVITY & WORKOUT WIDGET VIEW
struct ActivityWidgetView: View {
    var entry: CalyxoWidgetEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Image(systemName: "figure.run").foregroundColor(.orange)
                Text("ACTIVITY")
                    .font(.system(size: 10, weight: .black))
                    .foregroundColor(.orange)
                Spacer()
            }
            Spacer()
            HStack(alignment: .bottom) {
                VStack(alignment: .leading, spacing: 2) {
                    Text("\(entry.steps)")
                        .font(.system(size: 20, weight: .black, design: .rounded))
                        .foregroundColor(.white)
                    Text("Steps Today")
                        .font(.system(size: 9, weight: .bold))
                        .foregroundColor(.gray)
                }
                Spacer()
                if !entry.activeWorkoutName.isEmpty {
                    Text("💪 \(entry.activeWorkoutName)")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(calyxoGreen)
                        .lineLimit(1)
                }
            }
        }
        .padding(12)
        .calyxoWidgetBackground(calyxoBg)
    }
}

struct ActivityWidget: Widget {
    let kind = "CalyxoActivityWidget"
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: CalyxoWidgetProvider()) { entry in
            ActivityWidgetView(entry: entry)
        }
        .configurationDisplayName("Daily Activity")
        .description("Track daily steps and active workouts.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

