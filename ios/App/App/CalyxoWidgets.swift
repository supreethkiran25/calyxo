import WidgetKit
import SwiftUI

// Shared Timeline Entry
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
}

// Widget Provider
struct CalyxoWidgetProvider: TimelineProvider {
    func placeholder(in context: Context) -> CalyxoWidgetEntry {
        CalyxoWidgetEntry(
            date: Date(),
            calories: 1450,
            calorieGoal: 2200,
            water: 2100,
            waterGoal: 3000,
            protein: 120,
            proteinGoal: 150,
            carbs: 180,
            fat: 45,
            steps: 8420,
            streak: 7,
            activeWorkoutName: "Upper Body Hypertrophy"
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (CalyxoWidgetEntry) -> ()) {
        let entry = readSharedData()
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<CalyxoWidgetEntry>) -> ()) {
        let entry = readSharedData()
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 15, to: Date())!
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        completion(timeline)
    }

    private func readSharedData() -> CalyxoWidgetEntry {
        let sharedDefaults = UserDefaults(suiteName: "group.com.supreethkiran.calyxo") ?? UserDefaults.standard
        let calories = sharedDefaults.integer(forKey: "widget_calories")
        let water = sharedDefaults.integer(forKey: "widget_water")
        let streak = sharedDefaults.integer(forKey: "widget_streak")
        let steps = sharedDefaults.integer(forKey: "widget_steps")
        let workout = sharedDefaults.string(forKey: "widget_active_workout") ?? "Rest & Recovery"

        return CalyxoWidgetEntry(
            date: Date(),
            calories: calories > 0 ? calories : 1250,
            calorieGoal: 2200,
            water: water > 0 ? water : 1800,
            waterGoal: 3000,
            protein: 110,
            proteinGoal: 140,
            carbs: 150,
            fat: 40,
            steps: steps > 0 ? steps : 7200,
            streak: streak > 0 ? streak : 5,
            activeWorkoutName: workout
        )
    }
}

// ── 1. HYDRATION WIDGET ──────────────────────────────────────────────────────
struct HydrationWidgetView: View {
    var entry: CalyxoWidgetEntry
    @Environment(\.widgetFamily) var family

    var body: some View {
        ZStack {
            Color(red: 10/255, green: 10/255, blue: 12/255)
            VStack(alignment: .leading, spacing: 6) {
                HStack {
                    Image(systemName: "drop.fill")
                        .foregroundColor(.blue)
                    Text("HYDRATION")
                        .font(.system(size: 10, weight: .black))
                        .foregroundColor(.blue)
                    Spacer()
                    Text("🔥 \(entry.streak)d")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(.orange)
                }

                Spacer()

                Text("\(entry.water) ml")
                    .font(.system(size: 20, weight: .black, design: .rounded))
                    .foregroundColor(.white)

                ProgressView(value: Double(entry.water), total: Double(entry.waterGoal))
                    .tint(.blue)

                Text("\(max(0, entry.waterGoal - entry.water)) ml remaining")
                    .font(.system(size: 9, weight: .semibold))
                    .foregroundColor(.gray)
            }
            .padding(12)
        }
    }
}

// ── 2. NUTRITION & CALORIE WIDGET ────────────────────────────────────────────
struct NutritionWidgetView: View {
    var entry: CalyxoWidgetEntry
    @Environment(\.widgetFamily) var family

    var body: some View {
        ZStack {
            Color(red: 10/255, green: 10/255, blue: 12/255)
            VStack(alignment: .leading, spacing: 6) {
                HStack {
                    Image(systemName: "flame.fill")
                        .foregroundColor(Color(red: 16/255, green: 185/255, blue: 129/255))
                    Text("CALORIES")
                        .font(.system(size: 10, weight: .black))
                        .foregroundColor(Color(red: 16/255, green: 185/255, blue: 129/255))
                    Spacer()
                }

                Spacer()

                Text("\(entry.calories)")
                    .font(.system(size: 22, weight: .black, design: .monospaced))
                    .foregroundColor(.white)
                + Text(" / \(entry.calorieGoal) kcal")
                    .font(.system(size: 11, weight: .bold))
                    .foregroundColor(.gray)

                HStack(spacing: 8) {
                    Label("\(entry.protein)g P", systemImage: "circle.fill")
                        .font(.system(size: 9, weight: .bold))
                        .foregroundColor(.emerald)
                    Label("\(entry.carbs)g C", systemImage: "circle.fill")
                        .font(.system(size: 9, weight: .bold))
                        .foregroundColor(.yellow)
                    Label("\(entry.fat)g F", systemImage: "circle.fill")
                        .font(.system(size: 9, weight: .bold))
                        .foregroundColor(.red)
                }
            }
            .padding(12)
        }
    }
}

// ── 3. ACTIVITY & WORKOUT WIDGET ────────────────────────────────────────────
struct ActivityWidgetView: View {
    var entry: CalyxoWidgetEntry

    var body: some View {
        ZStack {
            Color(red: 10/255, green: 10/255, blue: 12/255)
            VStack(alignment: .leading, spacing: 6) {
                HStack {
                    Image(systemName: "figure.run")
                        .foregroundColor(.orange)
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
                    VStack(alignment: .trailing, spacing: 2) {
                        Text("💪 \(entry.activeWorkoutName)")
                            .font(.system(size: 10, weight: .bold))
                            .foregroundColor(Color(red: 16/255, green: 185/255, blue: 129/255))
                            .lineLimit(1)
                    }
                }
            }
            .padding(12)
        }
    }
}

// Color Extension
extension Color {
    static let emerald = Color(red: 16/255, green: 185/255, blue: 129/255)
}

// Widget Bundle
@main
struct CalyxoWidgetBundle: WidgetBundle {
    var body: some Widget {
        HydrationWidget()
        NutritionWidget()
        ActivityWidget()
    }
}

struct HydrationWidget: Widget {
    let kind: String = "CalyxoHydrationWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: CalyxoWidgetProvider()) { entry in
            HydrationWidgetView(entry: entry)
        }
        .configurationDisplayName("Hydration")
        .description("Track daily water consumption and hydration streaks.")
        .supportedFamilies([.systemSmall, .systemMedium, .accessoryCircular, .accessoryRectangular])
    }
}

struct NutritionWidget: Widget {
    let kind: String = "CalyxoNutritionWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: CalyxoWidgetProvider()) { entry in
            NutritionWidgetView(entry: entry)
        }
        .configurationDisplayName("Nutrition")
        .description("Track daily calories and macronutrient breakdown.")
        .supportedFamilies([.systemSmall, .systemMedium, .accessoryRectangular])
    }
}

struct ActivityWidget: Widget {
    let kind: String = "CalyxoActivityWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: CalyxoWidgetProvider()) { entry in
            ActivityWidgetView(entry: entry)
        }
        .configurationDisplayName("Activity")
        .description("Track daily steps and active workouts.")
        .supportedFamilies([.systemSmall, .systemMedium, .accessoryRectangular])
    }
}
