//
//  CalyxoNativeNutritionView.swift
//  Calyxo Native Nutrition Experience
//
//  Production-Grade SwiftUI Nutrition & Food Tracking Experience.
//  Interactive macro targets, instant searchable food directory, and meal logging.
//  Supports adaptive Light & Dark mode contrast.
//

import SwiftUI

public struct CalyxoNativeNutritionView: View {
    @ObservedObject private var engine = CalyxoNativeNutritionEngine.shared
    @State private var showingSearchSheet = false
    @State private var searchQuery = ""
    @State private var selectedFood: CalyxoNativeNutritionEngine.FoodItem?
    @State private var portionInputGrams: Double = 150.0
    
    public init() {}
    
    public var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Header
                HStack {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("DAILY NUTRITION")
                            .font(.system(size: 11, weight: .bold))
                            .tracking(1.5)
                            .foregroundColor(CalyxoDesignTokens.Colors.accentCyan)
                        Text("Fuel & Macros")
                            .font(.system(size: 24, weight: .heavy, design: .rounded))
                            .foregroundColor(CalyxoDesignTokens.Colors.textPrimary)
                    }
                    Spacer()
                    Button(action: { showingSearchSheet = true }) {
                        HStack(spacing: 6) {
                            Image(systemName: "plus")
                            Text("Log Food")
                        }
                        .font(.system(size: 13, weight: .bold))
                        .padding(.horizontal, 14)
                        .padding(.vertical, 8)
                        .background(CalyxoDesignTokens.Colors.accentCyan)
                        .foregroundColor(CalyxoDesignTokens.Colors.buttonPrimaryForeground)
                        .cornerRadius(8)
                    }
                }
                .padding(.horizontal)
                .padding(.top, 10)
                
                // Macro Energy Target Card
                macroEnergyCard
                
                // Macro Breakdown Grid
                macroBreakdownGrid
                
                // Today's Meals Timeline
                mealsTimelineSection
            }
            .padding(.bottom, 40)
        }
        .background(CalyxoDesignTokens.Colors.background.ignoresSafeArea())
        .sheet(isPresented: $showingSearchSheet) {
            foodSearchSheet
        }
    }
    
    // MARK: - Macro Energy Card
    private var macroEnergyCard: some View {
        VStack(spacing: 16) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text("ENERGY REMAINING")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(CalyxoDesignTokens.Colors.textSecondary)
                    Text("\(max(0, engine.targetCalories - engine.totalConsumedCalories))")
                        .font(.system(size: 36, weight: .black, design: .rounded))
                        .foregroundColor(CalyxoDesignTokens.Colors.textPrimary)
                    Text("kcal left of \(engine.targetCalories) goal")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(CalyxoDesignTokens.Colors.textSecondary)
                }
                Spacer()
                
                // Circular Calorie Ring
                ZStack {
                    Circle()
                        .stroke(CalyxoDesignTokens.Colors.cardBorder, lineWidth: 10)
                        .frame(width: 80, height: 80)
                    Circle()
                        .trim(from: 0.0, to: min(1.0, Double(engine.totalConsumedCalories) / Double(engine.targetCalories)))
                        .stroke(CalyxoDesignTokens.Colors.accentCyan, style: StrokeStyle(lineWidth: 10, lineCap: .round))
                        .frame(width: 80, height: 80)
                        .rotationEffect(.degrees(-90))
                    Text("\(Int(min(100.0, (Double(engine.totalConsumedCalories) / Double(engine.targetCalories)) * 100.0)))%")
                        .font(.system(size: 14, weight: .bold))
                        .foregroundColor(CalyxoDesignTokens.Colors.textPrimary)
                }
            }
        }
        .padding()
        .calyxoCard()
        .padding(.horizontal)
    }
    
    // MARK: - Macro Breakdown Grid
    private var macroBreakdownGrid: some View {
        HStack(spacing: 12) {
            macroTile(title: "Protein", current: engine.totalConsumedProtein, target: engine.targetProteinGrams, unit: "g", color: CalyxoDesignTokens.Colors.accentAcid)
            macroTile(title: "Carbs", current: engine.totalConsumedCarbs, target: engine.targetCarbsGrams, unit: "g", color: CalyxoDesignTokens.Colors.accentEmerald)
            macroTile(title: "Fat", current: engine.totalConsumedFat, target: engine.targetFatGrams, unit: "g", color: CalyxoDesignTokens.Colors.accentAmber)
        }
        .padding(.horizontal)
    }
    
    private func macroTile(title: String, current: Double, target: Double, unit: String, color: Color) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(title.uppercased())
                .font(.system(size: 9, weight: .bold))
                .foregroundColor(CalyxoDesignTokens.Colors.textSecondary)
            HStack(alignment: .lastTextBaseline, spacing: 2) {
                Text("\(Int(current))")
                    .font(.system(size: 18, weight: .heavy, design: .rounded))
                    .foregroundColor(CalyxoDesignTokens.Colors.textPrimary)
                Text("/\(Int(target))\(unit)")
                    .font(.system(size: 10, weight: .medium))
                    .foregroundColor(CalyxoDesignTokens.Colors.textSecondary)
            }
            Rectangle()
                .fill(CalyxoDesignTokens.Colors.cardBorder)
                .frame(height: 3)
                .overlay(
                    GeometryReader { geo in
                        Rectangle()
                            .fill(color)
                            .frame(width: geo.size.width * min(1.0, current / target))
                    },
                    alignment: .leading
                )
                .cornerRadius(1.5)
        }
        .padding(12)
        .frame(maxWidth: .infinity, alignment: .leading)
        .calyxoCard()
    }
    
    // MARK: - Meals Timeline
    private var mealsTimelineSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("TODAY'S LOGGED FOODS")
                .font(.system(size: 11, weight: .bold))
                .foregroundColor(CalyxoDesignTokens.Colors.textSecondary)
                .padding(.horizontal)
            
            if engine.todayLoggedFoods.isEmpty {
                VStack(spacing: 8) {
                    Text("No foods logged today yet.")
                        .font(.system(size: 13))
                        .foregroundColor(CalyxoDesignTokens.Colors.textSecondary)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 24)
                .calyxoCard()
                .padding(.horizontal)
            } else {
                VStack(spacing: 8) {
                    ForEach(engine.todayLoggedFoods) { food in
                        HStack {
                            VStack(alignment: .leading, spacing: 2) {
                                Text(food.name)
                                    .font(.system(size: 14, weight: .semibold))
                                    .foregroundColor(CalyxoDesignTokens.Colors.textPrimary)
                                Text("\(Int(food.portionWeightGrams))g • \(food.calories) kcal • \(Int(food.proteinGrams))g P • \(Int(food.carbsGrams))g C • \(Int(food.fatGrams))g F")
                                    .font(.system(size: 11))
                                    .foregroundColor(CalyxoDesignTokens.Colors.textSecondary)
                            }
                            Spacer()
                            Button(action: { engine.deleteFood(id: food.id) }) {
                                Image(systemName: "trash")
                                    .font(.system(size: 13))
                                    .foregroundColor(.red.opacity(0.8))
                                    .padding(6)
                            }
                        }
                        .padding(12)
                        .calyxoCard()
                    }
                }
                .padding(.horizontal)
            }
        }
    }
    
    // MARK: - Food Search Sheet
    private var foodSearchSheet: some View {
        NavigationView {
            VStack(spacing: 16) {
                // Search Field
                TextField("Search foods (e.g. Chicken, Rice, Oats)", text: $searchQuery)
                    .padding()
                    .background(CalyxoDesignTokens.Colors.surfaceSubtle)
                    .cornerRadius(12)
                    .foregroundColor(CalyxoDesignTokens.Colors.textPrimary)
                    .padding(.horizontal)
                
                // Portion Selector if food selected
                if let food = selectedFood {
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Selected: \(food.name)")
                            .font(.system(size: 14, weight: .bold))
                            .foregroundColor(CalyxoDesignTokens.Colors.accentCyan)
                        
                        HStack {
                            Text("Portion: \(Int(portionInputGrams)) grams")
                                .font(.system(size: 13, weight: .semibold))
                                .foregroundColor(CalyxoDesignTokens.Colors.textPrimary)
                            Spacer()
                            let scaled = food.scaled(portionGrams: portionInputGrams)
                            Text("\(scaled.calories) kcal | \(scaled.proteinGrams)g P")
                                .font(.system(size: 12, weight: .bold))
                                .foregroundColor(CalyxoDesignTokens.Colors.accentAcid)
                        }
                        
                        Slider(value: $portionInputGrams, in: 25...500, step: 25)
                            .accentColor(CalyxoDesignTokens.Colors.accentCyan)
                        
                        Button(action: {
                            engine.logFood(item: food, portionGrams: portionInputGrams)
                            showingSearchSheet = false
                            selectedFood = nil
                        }) {
                            Text("Add to Diary")
                                .font(.system(size: 15, weight: .bold))
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(CalyxoDesignTokens.Colors.accentCyan)
                                .foregroundColor(CalyxoDesignTokens.Colors.buttonPrimaryForeground)
                                .cornerRadius(10)
                        }
                    }
                    .padding()
                    .calyxoCard()
                    .padding(.horizontal)
                }
                
                // Food Results List
                List(engine.searchFoods(query: searchQuery)) { item in
                    Button(action: { selectedFood = item }) {
                        HStack {
                            VStack(alignment: .leading, spacing: 2) {
                                Text(item.name)
                                    .font(.system(size: 14, weight: .semibold))
                                    .foregroundColor(CalyxoDesignTokens.Colors.textPrimary)
                                Text("\(item.category) • \(Int(item.caloriesPer100g)) kcal/100g")
                                    .font(.system(size: 11))
                                    .foregroundColor(CalyxoDesignTokens.Colors.textSecondary)
                            }
                            Spacer()
                            Text("\(item.proteinPer100g, specifier: "%.1f")g P")
                                .font(.system(size: 12, weight: .bold))
                                .foregroundColor(CalyxoDesignTokens.Colors.accentAcid)
                        }
                    }
                    .listRowBackground(CalyxoDesignTokens.Colors.surface)
                }
                .listStyle(PlainListStyle())
            }
            .navigationTitle("Add Food")
            .navigationBarItems(trailing: Button("Done") { showingSearchSheet = false })
            .background(CalyxoDesignTokens.Colors.background.ignoresSafeArea())
        }
    }
}
