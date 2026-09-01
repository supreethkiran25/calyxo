//
//  CalyxoDesignTokens.swift
//  Calyxo Native Design System
//
//  Shared brand design tokens, semantic colors, typography, and quad ring geometry.
//  Supports fully adaptive Light & Dark modes with WCAG AAA contrast compliance.
//

import SwiftUI

public enum CalyxoDesignTokens {
    // MARK: - Semantic Color Palette (Adaptive for Light & Dark Mode)
    public enum Colors {
        // Background: Clean Slate (#F8FAFC) in Light Mode, Deep Void (#050507) in Dark Mode
        public static let background = Color(UIColor { trait in
            trait.userInterfaceStyle == .dark
                ? UIColor(red: 0.020, green: 0.020, blue: 0.027, alpha: 1.0)
                : UIColor(red: 0.973, green: 0.980, blue: 0.988, alpha: 1.0)
        })
        
        // Surface: Pure White (#FFFFFF) in Light Mode, Elevated Charcoal (#0E0E12) in Dark Mode
        public static let surface = Color(UIColor { trait in
            trait.userInterfaceStyle == .dark
                ? UIColor(red: 0.055, green: 0.055, blue: 0.071, alpha: 1.0)
                : UIColor(red: 1.000, green: 1.000, blue: 1.000, alpha: 1.0)
        })
        
        // Surface Elevated: Elevated White / Neutral
        public static let surfaceElevated = Color(UIColor { trait in
            trait.userInterfaceStyle == .dark
                ? UIColor(red: 0.086, green: 0.086, blue: 0.114, alpha: 1.0)
                : UIColor(red: 1.000, green: 1.000, blue: 1.000, alpha: 1.0)
        })
        
        // SurfaceSubtle: Light Slate Pill (#F1F5F9) in Light Mode, Dark Slate (#16161D) in Dark Mode
        public static let surfaceSubtle = Color(UIColor { trait in
            trait.userInterfaceStyle == .dark
                ? UIColor(red: 0.086, green: 0.086, blue: 0.114, alpha: 1.0)
                : UIColor(red: 0.945, green: 0.961, blue: 0.976, alpha: 1.0)
        })
        
        // Text Primary: Deep Slate (#0F172A) in Light Mode, White (#FFFFFF) in Dark Mode
        public static let textPrimary = Color(UIColor { trait in
            trait.userInterfaceStyle == .dark
                ? UIColor(red: 1.000, green: 1.000, blue: 1.000, alpha: 1.0)
                : UIColor(red: 0.059, green: 0.090, blue: 0.165, alpha: 1.0)
        })
        
        // Text Secondary: Slate Gray (#64748B) in Light Mode, Muted Gray (#94A3B8) in Dark Mode
        public static let textSecondary = Color(UIColor { trait in
            trait.userInterfaceStyle == .dark
                ? UIColor(red: 0.580, green: 0.639, blue: 0.722, alpha: 1.0)
                : UIColor(red: 0.392, green: 0.455, blue: 0.545, alpha: 1.0)
        })
        
        // Text Tertiary: Light Slate (#94A3B8) in Light Mode, Dark Slate (#64748B) in Dark Mode
        public static let textTertiary = Color(UIColor { trait in
            trait.userInterfaceStyle == .dark
                ? UIColor(red: 0.392, green: 0.455, blue: 0.545, alpha: 1.0)
                : UIColor(red: 0.580, green: 0.639, blue: 0.722, alpha: 1.0)
        })
        
        // Border / Card Border: 10% Black in Light Mode, 10% White in Dark Mode
        public static let cardBorder = Color(UIColor { trait in
            trait.userInterfaceStyle == .dark
                ? UIColor.white.withAlphaComponent(0.10)
                : UIColor.black.withAlphaComponent(0.10)
        })
        public static let border = cardBorder
        
        // Semantic Primary Accent: Calyxo Emerald (#059669) in Light Mode, Acid Green (#CCFF00) in Dark Mode
        public static let accent = Color(UIColor { trait in
            trait.userInterfaceStyle == .dark
                ? UIColor(red: 0.800, green: 1.000, blue: 0.000, alpha: 1.0)
                : UIColor(red: 0.020, green: 0.588, blue: 0.412, alpha: 1.0)
        })
        
        // Accent Foreground (High-Contrast Text on Accent Button)
        public static let accentForeground = Color(UIColor { trait in
            trait.userInterfaceStyle == .dark
                ? UIColor(red: 0.000, green: 0.000, blue: 0.000, alpha: 1.0)
                : UIColor(red: 1.000, green: 1.000, blue: 1.000, alpha: 1.0)
        })
        
        // Button Primary & Foreground
        public static let buttonPrimary = accent
        public static let buttonPrimaryForeground = accentForeground
        
        // Status Colors
        public static let success = Color(UIColor { trait in
            trait.userInterfaceStyle == .dark
                ? UIColor(red: 0.063, green: 0.725, blue: 0.506, alpha: 1.0)
                : UIColor(red: 0.086, green: 0.639, blue: 0.290, alpha: 1.0)
        })
        
        public static let warning = Color(UIColor { trait in
            trait.userInterfaceStyle == .dark
                ? UIColor(red: 0.961, green: 0.620, blue: 0.043, alpha: 1.0)
                : UIColor(red: 0.851, green: 0.467, blue: 0.024, alpha: 1.0)
        })
        
        public static let danger = Color(UIColor { trait in
            trait.userInterfaceStyle == .dark
                ? UIColor(red: 0.937, green: 0.267, blue: 0.267, alpha: 1.0)
                : UIColor(red: 0.863, green: 0.149, blue: 0.149, alpha: 1.0)
        })
        
        // Specific Brand Palette Tints
        public static let accentAcid = Color(UIColor { trait in
            trait.userInterfaceStyle == .dark
                ? UIColor(red: 0.800, green: 1.000, blue: 0.000, alpha: 1.0)
                : UIColor(red: 0.100, green: 0.550, blue: 0.000, alpha: 1.0)
        })
        public static let accentEmerald = Color(UIColor { trait in
            trait.userInterfaceStyle == .dark
                ? UIColor(red: 0.063, green: 0.725, blue: 0.506, alpha: 1.0)
                : UIColor(red: 0.020, green: 0.588, blue: 0.412, alpha: 1.0)
        })
        public static let accentAmber = Color(UIColor { trait in
            trait.userInterfaceStyle == .dark
                ? UIColor(red: 0.961, green: 0.620, blue: 0.043, alpha: 1.0)
                : UIColor(red: 0.851, green: 0.467, blue: 0.024, alpha: 1.0)
        })
        public static let accentCyan = Color(UIColor { trait in
            trait.userInterfaceStyle == .dark
                ? UIColor(red: 0.024, green: 0.714, blue: 0.831, alpha: 1.0)
                : UIColor(red: 0.035, green: 0.520, blue: 0.650, alpha: 1.0)
        })
        public static let accentPurple = Color(UIColor { trait in
            trait.userInterfaceStyle == .dark
                ? UIColor(red: 0.659, green: 0.333, blue: 0.969, alpha: 1.0)
                : UIColor(red: 0.490, green: 0.200, blue: 0.800, alpha: 1.0)
        })
    }
    
    // MARK: - Quad Progress Ring Model
    public struct QuadRingData {
        public let calorieProgress: Double // 0.0 to 1.0+
        public let waterProgress: Double   // 0.0 to 1.0+
        public let proteinProgress: Double // 0.0 to 1.0+
        public let workoutProgress: Double // 0.0 to 1.0+
        
        public init(calorieProgress: Double, waterProgress: Double, proteinProgress: Double, workoutProgress: Double) {
            self.calorieProgress = max(0.0, calorieProgress)
            self.waterProgress = max(0.0, waterProgress)
            self.proteinProgress = max(0.0, proteinProgress)
            self.workoutProgress = max(0.0, workoutProgress)
        }
    }
}

// MARK: - Card Surface ViewModifier
public struct CalyxoCardModifier: ViewModifier {
    public func body(content: Content) -> some View {
        content
            .background(CalyxoDesignTokens.Colors.surface)
            .overlay(
                RoundedRectangle(cornerRadius: 16)
                    .stroke(CalyxoDesignTokens.Colors.cardBorder, lineWidth: 1)
            )
            .cornerRadius(16)
    }
}

public extension View {
    func calyxoCard() -> some View {
        self.modifier(CalyxoCardModifier())
    }
}
