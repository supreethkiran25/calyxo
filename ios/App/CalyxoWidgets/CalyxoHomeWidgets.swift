import WidgetKit
import SwiftUI

// MARK: - Number Formatting Helper
extension Int {
    var formattedWithSeparator: String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .decimal
        formatter.maximumFractionDigits = 0
        return formatter.string(from: NSNumber(value: self)) ?? "\(self)"
    }
}

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
    let stepGoal: Int
    let streak: Int
    let activeWorkoutName: String
    let hasData: Bool
}

// MARK: - Modern Container Background Compatibility Modifier
extension View {
    func calyxoWidgetBackground(_ color: Color = Color(red: 12/255, green: 14/255, blue: 18/255)) -> some View {
        if #available(iOS 17.0, macOS 14.0, *) {
            return AnyView(
                self.containerBackground(for: .widget) {
                    ZStack {
                        color
                        LinearGradient(
                            gradient: Gradient(colors: [
                                Color.white.opacity(0.04),
                                Color.clear
                            ]),
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    }
                }
            )
        } else {
            return AnyView(self.background(color))
        }
    }
}

// MARK: - Timeline Provider (Real App Group Data + Proactive Background Refresh)
struct CalyxoWidgetProvider: TimelineProvider {
    func placeholder(in context: Context) -> CalyxoWidgetEntry {
        CalyxoWidgetEntry(
            date: Date(),
            calories: 1971, calorieGoal: 2875,
            water: 3000, waterGoal: 3000,
            protein: 107, proteinGoal: 124,
            carbs: 160, fat: 48,
            steps: 2524, stepGoal: 10000,
            streak: 5,
            activeWorkoutName: "",
            hasData: true
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (CalyxoWidgetEntry) -> ()) {
        completion(readSharedData())
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<CalyxoWidgetEntry>) -> ()) {
        let currentEntry = readSharedData()
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 5, to: Date()) ?? Date().addingTimeInterval(300)

        // Try proactive background fetch from Supabase if credentials are stored in App Group
        fetchLatestRemoteDataIfNeeded { updatedEntry in
            let finalEntry = updatedEntry ?? currentEntry
            completion(Timeline(entries: [finalEntry], policy: .after(nextUpdate)))
        }
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
        let stepGoal = d.integer(forKey: "widget_step_goal")
        let streak = d.integer(forKey: "widget_streak")
        let workout = d.string(forKey: "widget_active_workout") ?? ""

        let hasData = calories > 0 || water > 0 || steps > 0 || streak > 0 || !workout.isEmpty

        return CalyxoWidgetEntry(
            date: Date(),
            calories: calories,
            calorieGoal: calorieGoal > 0 ? calorieGoal : 2000,
            water: water,
            waterGoal: (waterGoal > 0 && waterGoal != 2500) ? waterGoal : 3000,
            protein: protein,
            proteinGoal: proteinGoal > 0 ? proteinGoal : 150,
            carbs: carbs,
            fat: fat,
            steps: steps,
            stepGoal: stepGoal > 0 ? stepGoal : 10000,
            streak: streak,
            activeWorkoutName: workout,
            hasData: hasData
        )
    }

    /// Autonomous background fetch directly from Supabase REST API without requiring app launch
    private func fetchLatestRemoteDataIfNeeded(completion: @escaping (CalyxoWidgetEntry?) -> Void) {
        let suiteName = "group.com.supreethkiran.calyxo"
        let d = UserDefaults(suiteName: suiteName) ?? .standard
        guard let supabaseUrl = d.string(forKey: "supabase_url"), !supabaseUrl.isEmpty,
              let anonKey = d.string(forKey: "supabase_anon_key"), !anonKey.isEmpty,
              let userId = d.string(forKey: "supabase_user_id"), !userId.isEmpty else {
            completion(nil)
            return
        }

        let authToken = d.string(forKey: "supabase_auth_token") ?? anonKey
        let calendar = Calendar.current
        let startOfDay = calendar.startOfDay(for: Date())
        let startOfDayMs = Int64(startOfDay.timeIntervalSince1970 * 1000)

        guard let foodUrl = URL(string: "\(supabaseUrl)/rest/v1/food_logs?userId=eq.\(userId)&timestamp=gte.\(startOfDayMs)&select=calories,protein,carbs,fat") else {
            completion(nil)
            return
        }

        var foodRequest = URLRequest(url: foodUrl)
        foodRequest.httpMethod = "GET"
        foodRequest.setValue("application/json", forHTTPHeaderField: "Accept")
        foodRequest.setValue(anonKey, forHTTPHeaderField: "apikey")
        foodRequest.setValue("Bearer \(authToken)", forHTTPHeaderField: "Authorization")
        foodRequest.timeoutInterval = 6.0

        let dispatchGroup = DispatchGroup()
        var didUpdateAny = false

        dispatchGroup.enter()
        let foodTask = URLSession.shared.dataTask(with: foodRequest) { data, response, error in
            defer { dispatchGroup.leave() }
            guard let data = data, error == nil,
                  let httpResponse = response as? HTTPURLResponse, (200...299).contains(httpResponse.statusCode) else {
                return
            }

            struct SupabaseMeal: Decodable {
                let calories: Double?
                let protein: Double?
                let carbs: Double?
                let fat: Double?
            }

            do {
                let meals = try JSONDecoder().decode([SupabaseMeal].self, from: data)
                let totalCals = Int(meals.reduce(0) { $0 + ($1.calories ?? 0) })
                let totalProt = Int(meals.reduce(0) { $0 + ($1.protein ?? 0) })
                let totalCarbs = Int(meals.reduce(0) { $0 + ($1.carbs ?? 0) })
                let totalFat = Int(meals.reduce(0) { $0 + ($1.fat ?? 0) })

                d.set(totalCals, forKey: "widget_calories")
                d.set(totalProt, forKey: "widget_protein")
                d.set(totalCarbs, forKey: "widget_carbs")
                d.set(totalFat, forKey: "widget_fat")
                didUpdateAny = true
            } catch {}
        }
        foodTask.resume()

        // Also query today's water from users_metrics
        if let waterUrl = URL(string: "\(supabaseUrl)/rest/v1/users_metrics?id=eq.\(userId)_water&select=amount") {
            dispatchGroup.enter()
            var waterRequest = URLRequest(url: waterUrl)
            waterRequest.httpMethod = "GET"
            waterRequest.setValue("application/json", forHTTPHeaderField: "Accept")
            waterRequest.setValue(anonKey, forHTTPHeaderField: "apikey")
            waterRequest.setValue("Bearer \(authToken)", forHTTPHeaderField: "Authorization")
            waterRequest.timeoutInterval = 6.0

            let waterTask = URLSession.shared.dataTask(with: waterRequest) { data, response, error in
                defer { dispatchGroup.leave() }
                guard let data = data, error == nil,
                      let httpResponse = response as? HTTPURLResponse, (200...299).contains(httpResponse.statusCode) else {
                    return
                }

                struct SupabaseWater: Decodable {
                    let amount: Double?
                }

                if let waterItems = try? JSONDecoder().decode([SupabaseWater].self, from: data),
                   let firstItem = waterItems.first, let amt = firstItem.amount {
                    d.set(Int(amt), forKey: "widget_water")
                    didUpdateAny = true
                }
            }
            waterTask.resume()
        }

        dispatchGroup.notify(queue: .main) {
            if didUpdateAny {
                d.synchronize()
                let updated = self.readSharedData()
                completion(updated)
            } else {
                completion(nil)
            }
        }
    }
}

// MARK: - Calyxo High-Vibrancy Brand Colors
private let calyxoEmerald = Color(red: 16/255, green: 185/255, blue: 129/255)  // #10B981
private let calyxoAmber   = Color(red: 245/255, green: 158/255, blue: 11/255)   // #F59E0B
private let calyxoCyan    = Color(red: 6/255, green: 182/255, blue: 212/255)    // #06B6D4
private let calyxoCoral   = Color(red: 244/255, green: 63/255, blue: 94/255)    // #F43F5E
private let calyxoBg      = Color(red: 12/255, green: 14/255, blue: 18/255)

// MARK: - Circular Progress Ring Component with Color Preservation
struct ProgressRing: View {
    var progress: Double
    var color: Color
    var lineWidth: CGFloat = 5.0

    var body: some View {
        ZStack {
            Circle()
                .stroke(color.opacity(0.20), lineWidth: lineWidth)
            Circle()
                .trim(from: 0.0, to: CGFloat(min(max(progress, 0.0), 1.0)))
                .stroke(
                    color,
                    style: StrokeStyle(lineWidth: lineWidth, lineCap: .round)
                )
                .rotationEffect(.degrees(-90))
                .shadow(color: color.opacity(0.3), radius: 2.5, x: 0, y: 0)
        }
        .widgetAccentable(false)
    }
}

// MARK: - 1. QUAD RINGS WIDGET VIEW (CALORIES, STEPS, HYDRATION, PROTEIN)
struct RingsWidgetView: View {
    var entry: CalyxoWidgetEntry
    @Environment(\.widgetFamily) var family

    private var calProgress: Double {
        guard entry.calorieGoal > 0 else { return 0 }
        return Double(entry.calories) / Double(entry.calorieGoal)
    }

    private var stepProgress: Double {
        guard entry.stepGoal > 0 else { return 0 }
        return Double(entry.steps) / Double(entry.stepGoal)
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
        switch family {
        case .accessoryCircular:
            // Lock Screen Concentric 4 Rings (Under Clock)
            ZStack {
                ProgressRing(progress: calProgress, color: calyxoAmber, lineWidth: 3.5)
                    .frame(width: 46, height: 46)
                ProgressRing(progress: stepProgress, color: calyxoEmerald, lineWidth: 3.2)
                    .frame(width: 37, height: 37)
                ProgressRing(progress: waterProgress, color: calyxoCyan, lineWidth: 2.8)
                    .frame(width: 28, height: 28)
                ProgressRing(progress: protProgress, color: calyxoCoral, lineWidth: 2.5)
                    .frame(width: 20, height: 20)
            }
            .calyxoWidgetBackground(.clear)

        case .accessoryRectangular:
            // Lock Screen Rectangular Widget with Concentric Rings + Stats
            HStack(spacing: 8) {
                ZStack {
                    ProgressRing(progress: calProgress, color: calyxoAmber, lineWidth: 3.0)
                        .frame(width: 38, height: 38)
                    ProgressRing(progress: stepProgress, color: calyxoEmerald, lineWidth: 2.7)
                        .frame(width: 30, height: 30)
                    ProgressRing(progress: waterProgress, color: calyxoCyan, lineWidth: 2.4)
                        .frame(width: 22, height: 22)
                    ProgressRing(progress: protProgress, color: calyxoCoral, lineWidth: 2.0)
                        .frame(width: 15, height: 15)
                }

                VStack(alignment: .leading, spacing: 2) {
                    HStack(spacing: 4) {
                        Text("⚡️ CALYXO")
                            .font(.system(size: 8.5, weight: .black))
                            .foregroundColor(.white)
                        Spacer()
                        if entry.streak > 0 {
                            Text("🔥\(entry.streak)d")
                                .font(.system(size: 8, weight: .bold))
                                .foregroundColor(.orange)
                        }
                    }

                    HStack(spacing: 6) {
                        HStack(spacing: 2) {
                            Circle().fill(calyxoAmber).frame(width: 4, height: 4)
                            Text("\(entry.calories.formattedWithSeparator)")
                                .font(.system(size: 10, weight: .black, design: .rounded))
                                .foregroundColor(.white)
                        }
                        HStack(spacing: 2) {
                            Circle().fill(calyxoEmerald).frame(width: 4, height: 4)
                            Text("\(entry.steps.formattedWithSeparator)")
                                .font(.system(size: 10, weight: .black, design: .rounded))
                                .foregroundColor(.white)
                        }
                    }

                    HStack(spacing: 6) {
                        HStack(spacing: 2) {
                            Circle().fill(calyxoCyan).frame(width: 4, height: 4)
                            Text("\(entry.water.formattedWithSeparator)ml")
                                .font(.system(size: 8.5, weight: .bold, design: .rounded))
                                .foregroundColor(Color.white.opacity(0.7))
                        }
                        HStack(spacing: 2) {
                            Circle().fill(calyxoCoral).frame(width: 4, height: 4)
                            Text("\(entry.protein.formattedWithSeparator)g")
                                .font(.system(size: 8.5, weight: .bold, design: .rounded))
                                .foregroundColor(Color.white.opacity(0.7))
                        }
                    }
                }
            }
            .padding(4)
            .calyxoWidgetBackground(.clear)

        case .accessoryInline:
            HStack(spacing: 3) {
                Text("⚡️ CALYXO: \(entry.steps.formattedWithSeparator) steps • \(entry.calories.formattedWithSeparator) kcal")
            }

        case .systemMedium:
            // Medium Widget (Desktop & Home Screen): Spacious 4 Interactive Side-by-Side Rings
            VStack(alignment: .leading, spacing: 0) {
                // Header Row
                HStack(alignment: .center, spacing: 6) {
                    Text("⚡ CALYXO")
                        .font(.system(size: 11, weight: .black, design: .rounded))
                        .foregroundColor(calyxoEmerald)
                        .widgetAccentable(false)
                    Text("• QUAD RINGS")
                        .font(.system(size: 9, weight: .black))
                        .foregroundColor(Color.white.opacity(0.65))
                        .tracking(0.5)

                    Spacer()

                    if entry.streak > 0 {
                        HStack(spacing: 3) {
                            Text("🔥")
                                .font(.system(size: 9))
                            Text("\(entry.streak)d")
                                .font(.system(size: 9, weight: .black, design: .rounded))
                                .foregroundColor(.orange)
                        }
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(Color.orange.opacity(0.15))
                        .cornerRadius(6)
                        .widgetAccentable(false)
                    }
                }
                .padding(.horizontal, 4)
                .padding(.bottom, 6)

                Spacer(minLength: 2)

                // 4 Interactive Rings
                HStack(spacing: 6) {
                    // 1. Calories Ring
                    VStack(spacing: 3.5) {
                        ZStack {
                            ProgressRing(progress: calProgress, color: calyxoAmber, lineWidth: 5.0)
                                .frame(width: 48, height: 48)
                            Text("\(Int(min(calProgress * 100, 999)))%")
                                .font(.system(size: 11, weight: .heavy, design: .rounded))
                                .foregroundColor(.white)
                        }
                        Text("CALORIES")
                            .font(.system(size: 8, weight: .black))
                            .foregroundColor(calyxoAmber)
                            .tracking(0.4)
                            .widgetAccentable(false)
                        Text("\(entry.calories.formattedWithSeparator)/\(entry.calorieGoal.formattedWithSeparator)")
                            .font(.system(size: 7.5, weight: .bold, design: .rounded))
                            .foregroundColor(Color.white.opacity(0.65))
                            .lineLimit(1)
                            .minimumScaleFactor(0.75)
                    }
                    .frame(maxWidth: .infinity)

                    // 2. Steps Ring
                    VStack(spacing: 3.5) {
                        ZStack {
                            ProgressRing(progress: stepProgress, color: calyxoEmerald, lineWidth: 5.0)
                                .frame(width: 48, height: 48)
                            Text("\(Int(min(stepProgress * 100, 999)))%")
                                .font(.system(size: 11, weight: .heavy, design: .rounded))
                                .foregroundColor(.white)
                        }
                        Text("STEPS")
                            .font(.system(size: 8, weight: .black))
                            .foregroundColor(calyxoEmerald)
                            .tracking(0.4)
                            .widgetAccentable(false)
                        Text("\(entry.steps.formattedWithSeparator)/\(entry.stepGoal.formattedWithSeparator)")
                            .font(.system(size: 7.5, weight: .bold, design: .rounded))
                            .foregroundColor(Color.white.opacity(0.65))
                            .lineLimit(1)
                            .minimumScaleFactor(0.75)
                    }
                    .frame(maxWidth: .infinity)

                    // 3. Hydration Ring
                    VStack(spacing: 3.5) {
                        ZStack {
                            ProgressRing(progress: waterProgress, color: calyxoCyan, lineWidth: 5.0)
                                .frame(width: 48, height: 48)
                            Text("\(Int(min(waterProgress * 100, 999)))%")
                                .font(.system(size: 11, weight: .heavy, design: .rounded))
                                .foregroundColor(.white)
                        }
                        Text("HYDRATION")
                            .font(.system(size: 8, weight: .black))
                            .foregroundColor(calyxoCyan)
                            .tracking(0.4)
                            .widgetAccentable(false)
                        Text("\(entry.water.formattedWithSeparator)/\(entry.waterGoal.formattedWithSeparator)ml")
                            .font(.system(size: 7.5, weight: .bold, design: .rounded))
                            .foregroundColor(Color.white.opacity(0.65))
                            .lineLimit(1)
                            .minimumScaleFactor(0.75)
                    }
                    .frame(maxWidth: .infinity)

                    // 4. Protein Ring
                    VStack(spacing: 3.5) {
                        ZStack {
                            ProgressRing(progress: protProgress, color: calyxoCoral, lineWidth: 5.0)
                                .frame(width: 48, height: 48)
                            Text("\(Int(min(protProgress * 100, 999)))%")
                                .font(.system(size: 11, weight: .heavy, design: .rounded))
                                .foregroundColor(.white)
                        }
                        Text("PROTEIN")
                            .font(.system(size: 8, weight: .black))
                            .foregroundColor(calyxoCoral)
                            .tracking(0.4)
                            .widgetAccentable(false)
                        Text("\(entry.protein.formattedWithSeparator)/\(entry.proteinGoal.formattedWithSeparator)g")
                            .font(.system(size: 7.5, weight: .bold, design: .rounded))
                            .foregroundColor(Color.white.opacity(0.65))
                            .lineLimit(1)
                            .minimumScaleFactor(0.75)
                    }
                    .frame(maxWidth: .infinity)
                }

                Spacer(minLength: 2)
            }
            .padding(.horizontal, 10)
            .padding(.vertical, 8)
            .calyxoWidgetBackground(calyxoBg)

        default:
            // Small Widget: Concentric 4 Rings with Stats Summary
            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text("⚡ CALYXO")
                        .font(.system(size: 9.5, weight: .black, design: .rounded))
                        .foregroundColor(calyxoEmerald)
                        .widgetAccentable(false)
                    Spacer()
                    if entry.streak > 0 {
                        Text("🔥 \(entry.streak)d")
                            .font(.system(size: 8.5, weight: .black))
                            .foregroundColor(.orange)
                            .widgetAccentable(false)
                    }
                }

                Spacer()

                HStack(spacing: 8) {
                    // 4 Concentric Rings
                    ZStack {
                        ProgressRing(progress: calProgress, color: calyxoAmber, lineWidth: 4.5)
                            .frame(width: 56, height: 56)
                        ProgressRing(progress: stepProgress, color: calyxoEmerald, lineWidth: 4)
                            .frame(width: 44, height: 44)
                        ProgressRing(progress: waterProgress, color: calyxoCyan, lineWidth: 3.5)
                            .frame(width: 33, height: 33)
                        ProgressRing(progress: protProgress, color: calyxoCoral, lineWidth: 3)
                            .frame(width: 23, height: 23)
                    }

                    VStack(alignment: .leading, spacing: 2) {
                        HStack(spacing: 3) {
                            Circle().fill(calyxoAmber).frame(width: 4.5, height: 4.5)
                            Text("\(entry.calories.formattedWithSeparator) kcal")
                                .font(.system(size: 8, weight: .bold))
                                .foregroundColor(.white)
                        }
                        HStack(spacing: 3) {
                            Circle().fill(calyxoEmerald).frame(width: 4.5, height: 4.5)
                            Text("\(entry.steps.formattedWithSeparator) steps")
                                .font(.system(size: 8, weight: .bold))
                                .foregroundColor(.white)
                        }
                        HStack(spacing: 3) {
                            Circle().fill(calyxoCyan).frame(width: 4.5, height: 4.5)
                            Text("\(entry.water.formattedWithSeparator) ml")
                                .font(.system(size: 8, weight: .bold))
                                .foregroundColor(.white)
                        }
                        HStack(spacing: 3) {
                            Circle().fill(calyxoCoral).frame(width: 4.5, height: 4.5)
                            Text("\(entry.protein.formattedWithSeparator)g prot")
                                .font(.system(size: 8, weight: .bold))
                                .foregroundColor(.white)
                        }
                    }
                }
            }
            .padding(10)
            .calyxoWidgetBackground(calyxoBg)
        }
    }
}

struct RingsWidget: Widget {
    let kind = "CalyxoRingsWidget"
    
    private var supportedFamiliesList: [WidgetFamily] {
        if #available(iOS 16.0, *) {
            return [.systemSmall, .systemMedium, .accessoryCircular, .accessoryRectangular, .accessoryInline]
        } else {
            return [.systemSmall, .systemMedium]
        }
    }

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: CalyxoWidgetProvider()) { entry in
            RingsWidgetView(entry: entry)
        }
        .configurationDisplayName("Daily Rings")
        .description("Track Calories, Steps, Hydration, and Protein rings on Home Screen & Lock Screen under clock.")
        .supportedFamilies(supportedFamiliesList)
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
                Text("💧 CALYXO")
                    .font(.system(size: 10, weight: .black, design: .rounded))
                    .foregroundColor(calyxoCyan)
                    .widgetAccentable(false)
                Text("• WATER")
                    .font(.system(size: 8.5, weight: .black))
                    .foregroundColor(.gray)
                Spacer()
                if entry.streak > 0 {
                    Text("🔥 \(entry.streak)d")
                        .font(.system(size: 9.5, weight: .bold))
                        .foregroundColor(.orange)
                        .widgetAccentable(false)
                }
            }
            Spacer()
            if entry.water > 0 {
                Text("\(entry.water.formattedWithSeparator) ml")
                    .font(.system(size: 20, weight: .black, design: .rounded))
                    .foregroundColor(.white)
                ProgressView(value: waterProgress)
                    .tint(calyxoCyan)
                Text("\(max(0, entry.waterGoal - entry.water).formattedWithSeparator) ml remaining")
                    .font(.system(size: 9, weight: .semibold))
                    .foregroundColor(.gray)
            } else {
                Text("0 ml")
                    .font(.system(size: 20, weight: .black, design: .rounded))
                    .foregroundColor(.white)
                ProgressView(value: 0.0)
                    .tint(calyxoCyan)
                Text("Goal: \(entry.waterGoal.formattedWithSeparator) ml")
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
                Text("🔥 CALYXO")
                    .font(.system(size: 10, weight: .black, design: .rounded))
                    .foregroundColor(calyxoAmber)
                    .widgetAccentable(false)
                Text("• NUTRITION")
                    .font(.system(size: 8.5, weight: .black))
                    .foregroundColor(.gray)
                Spacer()
            }
            Spacer()
            (Text("\(entry.calories.formattedWithSeparator)")
                .font(.system(size: 22, weight: .black, design: .rounded))
                .foregroundColor(.white)
            + Text(" / \(entry.calorieGoal.formattedWithSeparator) kcal")
                .font(.system(size: 11, weight: .bold))
                .foregroundColor(.gray))

            HStack(spacing: 8) {
                HStack(spacing: 2) {
                    Circle().fill(calyxoEmerald).frame(width: 5, height: 5)
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
            .widgetAccentable(false)
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

// MARK: - 4. ACTIVITY & STEPS WIDGET VIEW
struct ActivityWidgetView: View {
    var entry: CalyxoWidgetEntry
    @Environment(\.widgetFamily) var family

    private var stepProgress: Double {
        guard entry.stepGoal > 0 else { return 0 }
        return min(Double(entry.steps) / Double(entry.stepGoal), 1.0)
    }

    var body: some View {
        switch family {
        case .accessoryCircular:
            ZStack {
                ProgressRing(progress: stepProgress, color: calyxoEmerald, lineWidth: 3.5)
                    .frame(width: 42, height: 42)
                VStack(spacing: 0) {
                    Image(systemName: "figure.walk")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(calyxoEmerald)
                    Text("\(entry.steps.formattedWithSeparator)")
                        .font(.system(size: 8, weight: .heavy, design: .rounded))
                        .foregroundColor(.white)
                }
            }
            .calyxoWidgetBackground(.clear)

        case .accessoryRectangular:
            VStack(alignment: .leading, spacing: 2.5) {
                HStack(spacing: 3) {
                    Text("👟 CALYXO STEPS")
                        .font(.system(size: 8.5, weight: .black))
                        .foregroundColor(.white)
                    Spacer()
                    Text("\(Int(stepProgress * 100))%")
                        .font(.system(size: 9, weight: .bold))
                        .foregroundColor(calyxoEmerald)
                }

                (Text("\(entry.steps.formattedWithSeparator)")
                    .font(.system(size: 14, weight: .black, design: .rounded))
                    .foregroundColor(.white)
                + Text(" / \(entry.stepGoal.formattedWithSeparator)")
                    .font(.system(size: 9, weight: .bold))
                    .foregroundColor(.gray))

                ProgressView(value: stepProgress)
                    .tint(calyxoEmerald)
            }
            .padding(4)
            .calyxoWidgetBackground(.clear)

        case .accessoryInline:
            HStack(spacing: 3) {
                Text("👟 CALYXO: \(entry.steps.formattedWithSeparator) / \(entry.stepGoal.formattedWithSeparator) steps")
            }

        default:
            VStack(alignment: .leading, spacing: 6) {
                HStack {
                    Text("👟 CALYXO")
                        .font(.system(size: 10, weight: .black, design: .rounded))
                        .foregroundColor(calyxoEmerald)
                        .widgetAccentable(false)
                    Text("• STEPS")
                        .font(.system(size: 8.5, weight: .black))
                        .foregroundColor(.gray)
                    Spacer()
                    if entry.streak > 0 {
                        Text("🔥 \(entry.streak)d")
                            .font(.system(size: 9.5, weight: .bold))
                            .foregroundColor(.orange)
                            .widgetAccentable(false)
                    }
                }
                Spacer()
                HStack(alignment: .bottom) {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("\(entry.steps.formattedWithSeparator)")
                            .font(.system(size: 22, weight: .black, design: .rounded))
                            .foregroundColor(.white)
                        Text("of \(entry.stepGoal.formattedWithSeparator) steps")
                            .font(.system(size: 9, weight: .bold))
                            .foregroundColor(.gray)
                    }
                    Spacer()
                    ProgressRing(progress: stepProgress, color: calyxoEmerald, lineWidth: 5)
                        .frame(width: 36, height: 36)
                }
                if !entry.activeWorkoutName.isEmpty {
                    Text("💪 \(entry.activeWorkoutName)")
                        .font(.system(size: 9, weight: .bold))
                        .foregroundColor(calyxoEmerald)
                        .lineLimit(1)
                }
            }
            .padding(12)
            .calyxoWidgetBackground(calyxoBg)
        }
    }
}

struct ActivityWidget: Widget {
    let kind = "CalyxoActivityWidget"
    
    private var supportedFamiliesList: [WidgetFamily] {
        if #available(iOS 16.0, *) {
            return [.systemSmall, .systemMedium, .accessoryCircular, .accessoryRectangular, .accessoryInline]
        } else {
            return [.systemSmall, .systemMedium]
        }
    }

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: CalyxoWidgetProvider()) { entry in
            ActivityWidgetView(entry: entry)
        }
        .configurationDisplayName("Daily Activity & Steps")
        .description("Track daily steps and goal progress on Home & Lock Screen under clock.")
        .supportedFamilies(supportedFamiliesList)
    }
}
