package com.calyxo.app.foundation.design;

/**
 * Calyxo Android Native Design Tokens.
 * Matches iOS and Web brand identity with exact RGB/Hex constants.
 */
public final class CalyxoDesignTokens {
    public static final int COLOR_BACKGROUND = 0xFF050507;     // Deep Void Black (Dark Mode)
    public static final int COLOR_BACKGROUND_LIGHT = 0xFFF8FAFC; // Clean Slate (Light Mode)
    public static final int COLOR_SURFACE = 0xFF0E0E12;        // Elevated Charcoal (Dark Mode)
    public static final int COLOR_SURFACE_LIGHT = 0xFFFFFFFF;  // Pure White (Light Mode)
    public static final int COLOR_SURFACE_SUBTLE = 0xFF16161D; // Subtle Charcoal (Dark Mode)
    public static final int COLOR_SURFACE_SUBTLE_LIGHT = 0xFFF1F5F9; // Light Slate (Light Mode)
    
    public static final int COLOR_TEXT_PRIMARY = 0xFFFFFFFF;   // White (Dark Mode)
    public static final int COLOR_TEXT_PRIMARY_LIGHT = 0xFF0F172A; // Deep Slate (Light Mode)
    public static final int COLOR_TEXT_SECONDARY = 0xFF94A3B8; // Muted Gray (Dark Mode)
    public static final int COLOR_TEXT_SECONDARY_LIGHT = 0xFF64748B; // Slate Gray (Light Mode)
    
    public static final int COLOR_ACCENT_ACID = 0xFFCCFF00;    // Acid Green
    public static final int COLOR_ACCENT_EMERALD = 0xFF10B981; // Emerald Glow
    public static final int COLOR_ACCENT_CYAN = 0xFF06B6D4;    // Cyan
    public static final int COLOR_ACCENT_AMBER = 0xFFF59E0B;   // Amber
    
    public static class QuadProgressData {
        public final float stepProgress;
        public final float calorieProgress;
        public final float waterProgress;
        public final float workoutProgress;
        
        public QuadProgressData(float stepProgress, float calorieProgress, float waterProgress, float workoutProgress) {
            this.stepProgress = Math.max(0.0f, stepProgress);
            this.calorieProgress = Math.max(0.0f, calorieProgress);
            this.waterProgress = Math.max(0.0f, waterProgress);
            this.workoutProgress = Math.max(0.0f, workoutProgress);
        }
    }
}
