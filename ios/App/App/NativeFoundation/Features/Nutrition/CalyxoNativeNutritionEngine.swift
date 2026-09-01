//
//  CalyxoNativeNutritionEngine.swift
//  Calyxo Native Nutrition Engine
//
//  Production-Grade Native Nutrition, Food Search & Macro Calculator Engine for iOS.
//  Zero React / WebView dependency.
//  Coordinates food search, portion scaling, macro aggregation, and Supabase persistence.
//

import Foundation
import SwiftUI

public final class CalyxoNativeNutritionEngine: ObservableObject {
    public static let shared = CalyxoNativeNutritionEngine()
    
    // MARK: - Models
    public struct FoodItem: Identifiable, Codable {
        public let id: String
        public let name: String
        public let category: String
        public let caloriesPer100g: Double
        public let proteinPer100g: Double
        public let carbsPer100g: Double
        public let fatPer100g: Double
        
        public init(id: String, name: String, category: String, caloriesPer100g: Double, proteinPer100g: Double, carbsPer100g: Double, fatPer100g: Double) {
            self.id = id
            self.name = name
            self.category = category
            self.caloriesPer100g = caloriesPer100g
            self.proteinPer100g = proteinPer100g
            self.carbsPer100g = carbsPer100g
            self.fatPer100g = fatPer100g
        }
        
        public func scaled(portionGrams: Double) -> LoggedFoodEntry {
            let factor = max(1.0, portionGrams) / 100.0
            return LoggedFoodEntry(
                name: self.name,
                portionWeightGrams: portionGrams,
                calories: Int(round(self.caloriesPer100g * factor)),
                proteinGrams: round(self.proteinPer100g * factor * 10) / 10.0,
                carbsGrams: round(self.carbsPer100g * factor * 10) / 10.0,
                fatGrams: round(self.fatPer100g * factor * 10) / 10.0
            )
        }
    }
    
    public struct LoggedFoodEntry: Identifiable, Codable {
        public let id: UUID
        public let name: String
        public let portionWeightGrams: Double
        public let calories: Int
        public let proteinGrams: Double
        public let carbsGrams: Double
        public let fatGrams: Double
        public let timestamp: Int64
        
        public init(name: String, portionWeightGrams: Double, calories: Int, proteinGrams: Double, carbsGrams: Double, fatGrams: Double) {
            self.id = UUID()
            self.name = name
            self.portionWeightGrams = portionWeightGrams
            self.calories = calories
            self.proteinGrams = proteinGrams
            self.carbsGrams = carbsGrams
            self.fatGrams = fatGrams
            self.timestamp = Int64(Date().timeIntervalSince1970 * 1000)
        }
    }
    
    // MARK: - Published State
    @Published public private(set) var foodDatabase: [FoodItem] = []
    @Published public private(set) var todayLoggedFoods: [LoggedFoodEntry] = []
    @Published public var targetCalories: Int = 2200
    @Published public var targetProteinGrams: Double = 160.0
    @Published public var targetCarbsGrams: Double = 220.0
    @Published public var targetFatGrams: Double = 65.0
    
    private let authService = CalyxoNativeAuthService.shared
    
    private init() {
        loadCuratedFoodDatabase()
    }
    
    private func loadCuratedFoodDatabase() {
        self.foodDatabase = [
            FoodItem(id: "chicken_breast", name: "Chicken Breast (Boneless, Raw)", category: "Poultry", caloriesPer100g: 120, proteinPer100g: 22.5, carbsPer100g: 0.0, fatPer100g: 2.6),
            FoodItem(id: "atlantic_salmon", name: "Atlantic Salmon (Raw)", category: "Seafood", caloriesPer100g: 208, proteinPer100g: 20.4, carbsPer100g: 0.0, fatPer100g: 13.4),
            FoodItem(id: "whole_egg", name: "Whole Large Egg (Cooked)", category: "Dairy/Egg", caloriesPer100g: 143, proteinPer100g: 12.6, carbsPer100g: 0.7, fatPer100g: 9.5),
            FoodItem(id: "jasmine_rice", name: "Jasmine Rice (Cooked)", category: "Grains", caloriesPer100g: 130, proteinPer100g: 2.7, carbsPer100g: 28.2, fatPer100g: 0.3),
            FoodItem(id: "oatmeal", name: "Rolled Oats (Raw)", category: "Grains", caloriesPer100g: 389, proteinPer100g: 16.9, carbsPer100g: 66.3, fatPer100g: 6.9),
            FoodItem(id: "whey_protein", name: "Whey Protein Isolate Powder", category: "Supplements", caloriesPer100g: 375, proteinPer100g: 80.0, carbsPer100g: 3.3, fatPer100g: 1.5),
            FoodItem(id: "greek_yogurt", name: "Greek Yogurt (Nonfat, Plain)", category: "Dairy", caloriesPer100g: 59, proteinPer100g: 10.2, carbsPer100g: 3.6, fatPer100g: 0.4),
            FoodItem(id: "avocado", name: "Hass Avocado", category: "Fruit/Fat", caloriesPer100g: 160, proteinPer100g: 2.0, carbsPer100g: 8.5, fatPer100g: 14.7),
            FoodItem(id: "sweet_potato", name: "Sweet Potato (Baked)", category: "Vegetables", caloriesPer100g: 90, proteinPer100g: 2.0, carbsPer100g: 20.7, fatPer100g: 0.2),
            FoodItem(id: "banana", name: "Banana (Fresh)", category: "Fruit", caloriesPer100g: 89, proteinPer100g: 1.1, carbsPer100g: 22.8, fatPer100g: 0.3)
        ]
    }
    
    // MARK: - Search
    public func searchFoods(query: String) -> [FoodItem] {
        let trimmed = query.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        if trimmed.isEmpty { return foodDatabase }
        return foodDatabase.filter { $0.name.lowercased().contains(trimmed) || $0.category.lowercased().contains(trimmed) }
    }
    
    // MARK: - Daily Totals Calculation
    public var totalConsumedCalories: Int {
        return todayLoggedFoods.reduce(0) { $0 + $1.calories }
    }
    
    public var totalConsumedProtein: Double {
        return round(todayLoggedFoods.reduce(0.0) { $0 + $1.proteinGrams } * 10) / 10.0
    }
    
    public var totalConsumedCarbs: Double {
        return round(todayLoggedFoods.reduce(0.0) { $0 + $1.carbsGrams } * 10) / 10.0
    }
    
    public var totalConsumedFat: Double {
        return round(todayLoggedFoods.reduce(0.0) { $0 + $1.fatGrams } * 10) / 10.0
    }
    
    // MARK: - Log Food & Persist to Supabase
    public func logFood(item: FoodItem, portionGrams: Double, completion: ((Bool) -> Void)? = nil) {
        guard let session = authService.currentSession else {
            completion?(false)
            return
        }
        
        let entry = item.scaled(portionGrams: portionGrams)
        DispatchQueue.main.async {
            self.todayLoggedFoods.insert(entry, at: 0)
        }
        
        let payload: [String: Any] = [
            "id": entry.id.uuidString,
            "userId": session.userUUID,
            "name": entry.name,
            "calories": entry.calories,
            "protein": entry.proteinGrams,
            "carbs": entry.carbsGrams,
            "fat": entry.fatGrams,
            "portionWeight": entry.portionWeightGrams,
            "timestamp": entry.timestamp
        ]
        
        let endpoint = URL(string: "https://nwcatvlfoayzrwatvyrf.supabase.co/rest/v1/food_logs")!
        var request = URLRequest(url: endpoint)
        request.httpMethod = "POST"
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")
        request.addValue(authService.supabaseAnonKey, forHTTPHeaderField: "apikey")
        request.addValue("Bearer \(session.accessToken)", forHTTPHeaderField: "Authorization")
        request.addValue("return=representation", forHTTPHeaderField: "Prefer")
        
        do {
            request.httpBody = try JSONSerialization.data(withJSONObject: payload)
        } catch {
            completion?(false)
            return
        }
        
        URLSession.shared.dataTask(with: request) { _, _, error in
            let success = (error == nil)
            print("[CALYXO-NUTRITION] 🥗 Food logged to Supabase: \(entry.name) (\(entry.calories) kcal, Success: \(success))")
            DispatchQueue.main.async {
                completion?(success)
            }
        }.resume()
    }
    
    public func deleteFood(id: UUID) {
        DispatchQueue.main.async {
            self.todayLoggedFoods.removeAll { $0.id == id }
        }
    }
}
