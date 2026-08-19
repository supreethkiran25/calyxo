//
//  NutritionView.swift
//  CALYXOAPP
//

import SwiftUI
import SwiftData

/// A view that provides a comprehensive nutrition center interface, allowing users to track diets, log meals, scan food items, and manage grocery lists.
public struct NutritionView: View {
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \MealLog.timestamp, order: .reverse) private var allMeals: [MealLog]
    @Query private var userProfiles: [UserProfile]
    
    @State private var activeSegment: String = NSLocalizedString("FOOD DIARY", comment: "Segment title")
    @State private var searchQuery: String = ""
    @State private var showSearchSheet: Bool = false
    @State private var showCreateCustomFoodSheet: Bool = false
    @State private var selectedSlotForSearch: String = NSLocalizedString("Breakfast", comment: "Default meal slot for search")
    
    /// The current user profile, or a default empty profile if none exists.
    var profile: UserProfile {
        userProfiles.first ?? UserProfile()
    }
    
    /// Meals logged today.
    var todayMeals: [MealLog] {
        allMeals.filter { Calendar.current.isDateInToday($0.timestamp) }
    }
    
    /// Total calories consumed today.
    var consumedCalories: Int { todayMeals.reduce(0) { $0 + $1.calories } }
    /// Total protein logged today.
    var proteinLogged: Double { todayMeals.reduce(0.0) { $0 + $1.protein } }
    /// Total carbs logged today.
    var carbsLogged: Double { todayMeals.reduce(0.0) { $0 + $1.carbs } }
    /// Total fat logged today.
    var fatLogged: Double { todayMeals.reduce(0.0) { $0 + $1.fat } }
    
    /// Determines if the profile has valid daily goals set.
    var hasValidGoals: Bool {
        profile.dailyCalorieGoal > 0 && profile.dailyProteinGoal > 0 && profile.dailyCarbsGoal > 0 && profile.dailyFatGoal > 0
    }
    
    public init() {}
    
    public var body: some View {
        NavigationStack {
            ZStack {
                CalyxoTheme.background
                    .ignoresSafeArea()
                
                ScrollView {
                    VStack(alignment: .leading, spacing: 18) {
                        // Header Title Section
                        VStack(alignment: .leading, spacing: 4) {
                            Text(NSLocalizedString("NUTRITION CENTER", comment: "Section title"))
                                .font(.system(.title2, design: .rounded, weight: .black))
                                .foregroundColor(CalyxoTheme.textPrimary)
                            Text(NSLocalizedString("Track diets, logs, scanning and grocery compilation lists", comment: "Section subtitle"))
                                .font(.subheadline)
                                .foregroundColor(CalyxoTheme.textSecondary)
                        }
                        .padding(.horizontal)
                        .padding(.top, 8)
                        
                        // Top Segment Control Pills
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 8) {
                                ForEach([NSLocalizedString("FOOD DIARY", comment: "Segment title"),
                                         NSLocalizedString("MEAL PLANNER", comment: "Segment title"),
                                         NSLocalizedString("MEAL SCANNER", comment: "Segment title"),
                                         NSLocalizedString("GROCERY LIST", comment: "Segment title")], id: \.self) { seg in
                                    Button(action: {
                                        activeSegment = seg
                                        Haptics.selection()
                                    }) {
                                        Text(seg)
                                            .font(.caption.bold())
                                            .padding(.horizontal, 16)
                                            .padding(.vertical, 10)
                                            .background(activeSegment == seg ? CalyxoTheme.emeraldPrimary : CalyxoTheme.surface)
                                            .foregroundColor(activeSegment == seg ? .white : CalyxoTheme.textPrimary)
                                            .clipShape(Capsule())
                                    }
                                }
                            }
                            .padding(.horizontal)
                        }
                        
                        if activeSegment == NSLocalizedString("FOOD DIARY", comment: "Segment title") {
                            // Top Row: Search Foods Card & Today's Macro Targets Card
                            VStack(spacing: 16) {
                                // SEARCH FOODS & LOG CARD
                                MinimalCard(cornerRadius: 20, padding: 18) {
                                    VStack(alignment: .leading, spacing: 12) {
                                        VStack(alignment: .leading, spacing: 2) {
                                            Text(NSLocalizedString("SEARCH FOODS & LOG", comment: "Search section title"))
                                                .font(.caption2.bold())
                                                .foregroundColor(CalyxoTheme.textPrimary)
                                            Text(NSLocalizedString("SELECT ITEMS TO INSTANTLY TRACK CALORIE MACROS", comment: "Search section subtitle"))
                                                .font(.system(size: 10, weight: .bold))
                                                .foregroundColor(CalyxoTheme.textSecondary)
                                        }
                                        
                                        HStack {
                                            Image(systemName: "magnifyingglass")
                                                .foregroundColor(CalyxoTheme.textSecondary)
                                            TextField(NSLocalizedString("Search oats, chicken breast, paneer...", comment: "Search placeholder"), text: $searchQuery)
                                                .foregroundColor(CalyxoTheme.textPrimary)
                                                .accessibilityLabel(Text(NSLocalizedString("Search foods", comment: "Accessibility label for search field")))
                                                .onSubmit {
                                                    if !searchQuery.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                                                        showSearchSheet = true
                                                    }
                                                }
                                        }
                                        .padding(12)
                                        .background(CalyxoTheme.surface)
                                        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                                        .onTapGesture {
                                            showSearchSheet = true
                                        }
                                        
                                        HStack {
                                            Spacer()
                                            Button(action: {
                                                showCreateCustomFoodSheet = true
                                                Haptics.selection()
                                            }) {
                                                HStack(spacing: 4) {
                                                    Text("+")
                                                    Text(NSLocalizedString("CREATE CUSTOM FOOD", comment: "Button title"))
                                                }
                                                .font(.caption2.bold())
                                                .foregroundColor(CalyxoTheme.emeraldLight)
                                            }
                                            .accessibilityLabel(Text(NSLocalizedString("Create custom food", comment: "Accessibility label for create custom food button")))
                                        }
                                    }
                                }
                                
                                // TODAY'S MACRO TARGETS CARD
                                MinimalCard(cornerRadius: 20, padding: 18) {
                                    VStack(alignment: .leading, spacing: 14) {
                                        HStack {
                                            Text(NSLocalizedString("TODAY'S MACRO TARGETS", comment: "Macro targets title"))
                                                .font(.caption2.bold())
                                                .foregroundColor(CalyxoTheme.textPrimary)
                                            Spacer()
                                            if hasValidGoals {
                                                Text("\(consumedCalories) / \(profile.dailyCalorieGoal) kcal")
                                                    .font(.caption2.bold())
                                                    .padding(.horizontal, 10)
                                                    .padding(.vertical, 4)
                                                    .background(CalyxoTheme.emeraldPrimary.opacity(0.18))
                                                    .foregroundColor(CalyxoTheme.emeraldLight)
                                                    .clipShape(Capsule())
                                            } else {
                                                Text(NSLocalizedString("Set up your profile goals", comment: "Instruction to set profile goals"))
                                                    .font(.caption2.bold())
                                                    .foregroundColor(CalyxoTheme.textSecondary)
                                            }
                                        }
                                        
                                        if hasValidGoals {
                                            HStack(spacing: 12) {
                                                // PROTEIN BAR
                                                MacroBarBox(
                                                    title: NSLocalizedString("PROTEIN", comment: "Protein macro title"),
                                                    current: Int(proteinLogged),
                                                    target: profile.dailyProteinGoal,
                                                    unit: NSLocalizedString("g", comment: "grams unit"),
                                                    color: CalyxoTheme.emeraldPrimary
                                                )
                                                
                                                // CARBS BAR
                                                MacroBarBox(
                                                    title: NSLocalizedString("CARBS", comment: "Carbs macro title"),
                                                    current: Int(carbsLogged),
                                                    target: profile.dailyCarbsGoal,
                                                    unit: NSLocalizedString("g", comment: "grams unit"),
                                                    color: CalyxoTheme.amberWarning
                                                )
                                                
                                                // FATS BAR
                                                MacroBarBox(
                                                    title: NSLocalizedString("FATS", comment: "Fats macro title"),
                                                    current: Int(fatLogged),
                                                    target: profile.dailyFatGoal,
                                                    unit: NSLocalizedString("g", comment: "grams unit"),
                                                    color: CalyxoTheme.roseAlert
                                                )
                                            }
                                        }
                                    }
                                }
                            }
                            .padding(.horizontal)
                            
                            // Favorites & Recently Logged Row
                            VStack(spacing: 14) {
                                HStack(spacing: 14) {
                                    // FAVORITES CARD
                                    MinimalCard(cornerRadius: 18, padding: 14) {
                                        VStack(alignment: .leading, spacing: 6) {
                                            HStack(spacing: 4) {
                                                Image(systemName: "star.fill")
                                                    .foregroundColor(CalyxoTheme.amberWarning)
                                                    .font(.caption)
                                                Text(String(format: NSLocalizedString("FAVORITES (%d)", comment: "Favorites count"), 0))
                                                    .font(.caption2.bold())
                                                    .foregroundColor(CalyxoTheme.textPrimary)
                                            }
                                            Text(NSLocalizedString("No favorites starred yet. Search and click Star to save!", comment: "No favorites message"))
                                                .font(.caption2)
                                                .foregroundColor(CalyxoTheme.textSecondary)
                                                .lineLimit(2)
                                        }
                                    }
                                    
                                    // RECENTLY LOGGED CARD
                                    MinimalCard(cornerRadius: 18, padding: 14) {
                                        VStack(alignment: .leading, spacing: 6) {
                                            HStack(spacing: 4) {
                                                Image(systemName: "calendar")
                                                    .foregroundColor(CalyxoTheme.cyanAccent)
                                                    .font(.caption)
                                                Text(NSLocalizedString("RECENTLY LOGGED", comment: "Recently logged title"))
                                                    .font(.caption2.bold())
                                                    .foregroundColor(CalyxoTheme.textPrimary)
                                            }
                                            if let recent = todayMeals.first {
                                                Text("\(recent.name) \(recent.calories) kcal")
                                                    .font(.caption2.bold())
                                                    .padding(.horizontal, 8)
                                                    .padding(.vertical, 4)
                                                    .background(CalyxoTheme.surface)
                                                    .foregroundColor(CalyxoTheme.emeraldLight)
                                                    .clipShape(Capsule())
                                            } else {
                                                Text(NSLocalizedString("Chicken Momos (Steamed) 320 kcal", comment: "Placeholder recent meal"))
                                                    .font(.caption2.bold())
                                                    .padding(.horizontal, 8)
                                                    .padding(.vertical, 4)
                                                    .background(CalyxoTheme.surface)
                                                    .foregroundColor(CalyxoTheme.emeraldLight)
                                                    .clipShape(Capsule())
                                            }
                                        }
                                    }
                                }
                            }
                            .padding(.horizontal)
                            
                            // LOGGED INTAKE TIMELINE CARD
                            MinimalCard(cornerRadius: 20, padding: 18) {
                                VStack(alignment: .leading, spacing: 14) {
                                    Text(NSLocalizedString("LOGGED INTAKE TIMELINE", comment: "Logged intake timeline title"))
                                        .font(.caption2.bold())
                                        .foregroundColor(CalyxoTheme.textPrimary)
                                    
                                    if todayMeals.isEmpty {
                                        HStack {
                                            VStack(alignment: .leading, spacing: 4) {
                                                Text(NSLocalizedString("Chicken Momos (Steamed) (200g)", comment: "Placeholder meal name"))
                                                    .font(.subheadline.bold())
                                                    .foregroundColor(CalyxoTheme.textPrimary)
                                                Text(NSLocalizedString("P: 18.4g | C: 48g | F: 6.4g", comment: "Placeholder macros"))
                                                    .font(.caption)
                                                    .foregroundColor(CalyxoTheme.textSecondary)
                                            }
                                            Spacer()
                                            Text("+320 kcal")
                                                .font(.caption.bold())
                                                .foregroundColor(CalyxoTheme.emeraldLight)
                                            Image(systemName: "trash")
                                                .font(.caption)
                                                .foregroundColor(CalyxoTheme.roseAlert)
                                                .padding(.leading, 8)
                                        }
                                        .padding(12)
                                        .background(CalyxoTheme.surface)
                                        .clipShape(RoundedRectangle(cornerRadius: 12))
                                    } else {
                                        ForEach(todayMeals) { meal in
                                            HStack {
                                                VStack(alignment: .leading, spacing: 4) {
                                                    Text(meal.name)
                                                        .font(.subheadline.bold())
                                                        .foregroundColor(CalyxoTheme.textPrimary)
                                                    Text(String(format: NSLocalizedString("P: %.1fg | C: %.1fg | F: %.1fg", comment: "Macros display"), meal.protein, meal.carbs, meal.fat))
                                                        .font(.caption)
                                                        .foregroundColor(CalyxoTheme.textSecondary)
                                                }
                                                Spacer()
                                                Text("+\(meal.calories) kcal")
                                                    .font(.caption.bold())
                                                    .foregroundColor(CalyxoTheme.emeraldLight)
                                                Button(action: {
                                                    modelContext.delete(meal)
                                                    Haptics.notify(.success)
                                                }) {
                                                    Image(systemName: "trash")
                                                        .font(.caption)
                                                        .foregroundColor(CalyxoTheme.roseAlert)
                                                        .padding(.leading, 8)
                                                }
                                            }
                                            .padding(12)
                                            .background(CalyxoTheme.surface)
                                            .clipShape(RoundedRectangle(cornerRadius: 12))
                                        }
                                    }
                                }
                            }
                            .padding(.horizontal)
                        } else if activeSegment == NSLocalizedString("MEAL PLANNER", comment: "Segment title") {
                            MinimalCard(cornerRadius: 20, padding: 18) {
                                VStack(alignment: .leading, spacing: 12) {
                                    Text(NSLocalizedString("MEAL PLANNER", comment: "Meal planner title"))
                                        .font(.headline.bold())
                                        .foregroundColor(CalyxoTheme.textPrimary)
                                    Text(NSLocalizedString("Plan your weekly calorie & macro schedules ahead of time.", comment: "Meal planner subtitle"))
                                        .font(.caption)
                                        .foregroundColor(CalyxoTheme.textSecondary)
                                }
                            }
                            .padding(.horizontal)
                        } else if activeSegment == NSLocalizedString("MEAL SCANNER", comment: "Segment title") {
                            MinimalCard(cornerRadius: 20, padding: 18) {
                                VStack(alignment: .leading, spacing: 12) {
                                    Text(NSLocalizedString("AI MEAL SCANNER", comment: "Meal scanner title"))
                                        .font(.headline.bold())
                                        .foregroundColor(CalyxoTheme.textPrimary)
                                    Text(NSLocalizedString("Scan barcodes or snap photos to auto-extract nutrition data.", comment: "Meal scanner subtitle"))
                                        .font(.caption)
                                        .foregroundColor(CalyxoTheme.textSecondary)
                                }
                            }
                            .padding(.horizontal)
                        } else {
                            MinimalCard(cornerRadius: 20, padding: 18) {
                                VStack(alignment: .leading, spacing: 12) {
                                    Text(NSLocalizedString("GROCERY LIST", comment: "Grocery list title"))
                                        .font(.headline.bold())
                                        .foregroundColor(CalyxoTheme.textPrimary)
                                    Text(NSLocalizedString("Auto-generated weekly shopping compilation based on your meal plan.", comment: "Grocery list subtitle"))
                                        .font(.caption)
                                        .foregroundColor(CalyxoTheme.textSecondary)
                                }
                            }
                            .padding(.horizontal)
                        }
                        
                        Spacer().frame(height: 100)
                    }
                }
            }
            .navigationTitle(NSLocalizedString("Nutrition", comment: "Navigation bar title"))
            .navigationBarTitleDisplayMode(.inline)
            .sheet(isPresented: $showSearchSheet) {
                FoodSearchSheet(defaultCategory: selectedSlotForSearch)
            }
            .sheet(isPresented: $showCreateCustomFoodSheet) {
                CreateCustomFoodSheet()
            }
        }
    }
}

/// A view representing a macro nutrient progress bar including current and target values, and a visual progress bar.
struct MacroBarBox: View {
    let title: String
    let current: Int
    let target: Int
    let unit: String
    let color: Color
    
    /// Progress ratio between current and target; 0 if target is zero or less.
    var progress: Double {
        guard target > 0 else { return 0 }
        return min(Double(current) / Double(target), 1.0)
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title)
                .font(.system(size: 9, weight: .bold))
                .foregroundColor(CalyxoTheme.textSecondary)
            if target > 0 {
                Text("\(current) / \(target)\(unit)")
                    .font(.caption.bold())
                    .foregroundColor(color)
            } else {
                Text(NSLocalizedString("N/A", comment: "Not available for macro target"))
                    .font(.caption.bold())
                    .foregroundColor(CalyxoTheme.textSecondary)
            }
            
            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 4)
                        .fill(CalyxoTheme.divider)
                        .frame(height: 4)
                    if target > 0 {
                        RoundedRectangle(cornerRadius: 4)
                            .fill(color)
                            .frame(width: geo.size.width * progress, height: 4)
                    }
                }
            }
            .frame(height: 4)
        }
        .padding(10)
        .background(CalyxoTheme.surface)
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

/// A view that provides an interface for creating and logging a custom food item with validation and error handling.
struct CreateCustomFoodSheet: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) var dismiss
    
    @State private var name: String = ""
    @State private var calories: String = "250"
    @State private var protein: String = "15"
    @State private var carbs: String = "30"
    @State private var fat: String = "8"
    
    @State private var showValidationError: Bool = false
    @State private var validationMessage: String = ""
    
    var body: some View {
        NavigationStack {
            ZStack {
                CalyxoTheme.background.ignoresSafeArea()
                
                VStack(spacing: 16) {
                    MinimalCard(cornerRadius: 20, padding: 16) {
                        VStack(spacing: 12) {
                            TextField(NSLocalizedString("Food Name (e.g. Oats with Milk)", comment: "Food name placeholder"), text: $name)
                                .padding(10)
                                .background(CalyxoTheme.surface)
                                .clipShape(RoundedRectangle(cornerRadius: 10))
                                .accessibilityLabel(Text(NSLocalizedString("Food Name", comment: "Accessibility label for food name input")))
                                .disableAutocorrection(true)
                            
                            HStack {
                                TextField(NSLocalizedString("Calories", comment: "Calories placeholder"), text: $calories)
                                    .keyboardType(.numberPad)
                                    .padding(10)
                                    .background(CalyxoTheme.surface)
                                    .clipShape(RoundedRectangle(cornerRadius: 10))
                                    .accessibilityLabel(Text(NSLocalizedString("Calories", comment: "Accessibility label for calories input")))
                                TextField(NSLocalizedString("Protein (g)", comment: "Protein placeholder"), text: $protein)
                                    .keyboardType(.decimalPad)
                                    .padding(10)
                                    .background(CalyxoTheme.surface)
                                    .clipShape(RoundedRectangle(cornerRadius: 10))
                                    .accessibilityLabel(Text(NSLocalizedString("Protein in grams", comment: "Accessibility label for protein input")))
                            }
                            
                            HStack {
                                TextField(NSLocalizedString("Carbs (g)", comment: "Carbs placeholder"), text: $carbs)
                                    .keyboardType(.decimalPad)
                                    .padding(10)
                                    .background(CalyxoTheme.surface)
                                    .clipShape(RoundedRectangle(cornerRadius: 10))
                                    .accessibilityLabel(Text(NSLocalizedString("Carbs in grams", comment: "Accessibility label for carbs input")))
                                TextField(NSLocalizedString("Fat (g)", comment: "Fat placeholder"), text: $fat)
                                    .keyboardType(.decimalPad)
                                    .padding(10)
                                    .background(CalyxoTheme.surface)
                                    .clipShape(RoundedRectangle(cornerRadius: 10))
                                    .accessibilityLabel(Text(NSLocalizedString("Fat in grams", comment: "Accessibility label for fat input")))
                            }
                        }
                    }
                    .padding(.horizontal)
                    .padding(.top, 16)
                    
                    Button(action: {
                        saveFood()
                    }) {
                        Text(NSLocalizedString("Save & Log Food", comment: "Save and log food button title"))
                            .font(.headline.bold())
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 14)
                            .background(CalyxoTheme.emeraldGradient)
                            .clipShape(Capsule())
                    }
                    .accessibilityLabel(Text(NSLocalizedString("Save and Log Food", comment: "Accessibility label for save food button")))
                    .padding(.horizontal)
                    .alert(isPresented: $showValidationError) {
                        Alert(
                            title: Text(NSLocalizedString("Invalid Input", comment: "Validation error title")),
                            message: Text(validationMessage),
                            dismissButton: .default(Text(NSLocalizedString("OK", comment: "OK button")))
                        )
                    }
                    
                    Spacer()
                }
            }
            .navigationTitle(NSLocalizedString("Create Custom Food", comment: "Create custom food screen title"))
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button(NSLocalizedString("Cancel", comment: "Cancel button")) { dismiss() }
                }
            }
        }
    }
    
    /// Validates inputs and saves the custom food to the model context if valid.
    private func saveFood() {
        let trimmedName = name.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmedName.isEmpty else {
            validationMessage = NSLocalizedString("Please enter a valid food name.", comment: "Empty food name error message")
            showValidationError = true
            return
        }
        
        guard let caloriesValue = Int(calories), caloriesValue >= 0 else {
            validationMessage = NSLocalizedString("Please enter a valid non-negative integer for calories.", comment: "Invalid calories error message")
            showValidationError = true
            return
        }
        
        guard let proteinValue = Double(protein), proteinValue >= 0 else {
            validationMessage = NSLocalizedString("Please enter a valid non-negative number for protein.", comment: "Invalid protein error message")
            showValidationError = true
            return
        }
        
        guard let carbsValue = Double(carbs), carbsValue >= 0 else {
            validationMessage = NSLocalizedString("Please enter a valid non-negative number for carbs.", comment: "Invalid carbs error message")
            showValidationError = true
            return
        }
        
        guard let fatValue = Double(fat), fatValue >= 0 else {
            validationMessage = NSLocalizedString("Please enter a valid non-negative number for fat.", comment: "Invalid fat error message")
            showValidationError = true
            return
        }
        
        let newMeal = MealLog(
            name: trimmedName,
            category: NSLocalizedString("Custom", comment: "Custom food category"),
            calories: caloriesValue,
            protein: proteinValue,
            carbs: carbsValue,
            fat: fatValue,
            timestamp: Date()
        )
        modelContext.insert(newMeal)
        Haptics.notify(.success)
        dismiss()
    }
}
