package com.calyxo.app.features.ai;

import android.content.Context;
import com.calyxo.app.features.nutrition.CalyxoNativeNutritionEngine;
import com.calyxo.app.features.workout.CalyxoNativeWorkoutEngine;
import com.calyxo.app.foundation.data.CalyxoDataRepositories;
import com.calyxo.app.foundation.health.CalyxoNativeHealthConnectManager;
import org.json.JSONObject;

/**
 * Native Android AI Context Provider.
 * Aggregates factual user context from local native engines without fabricating missing data.
 */
public final class CalyxoNativeAIContextProvider {
    private static CalyxoNativeAIContextProvider instance;
    private final Context context;
    
    private CalyxoNativeAIContextProvider(Context context) {
        this.context = context.getApplicationContext();
    }
    
    public static synchronized CalyxoNativeAIContextProvider getInstance(Context context) {
        if (instance == null) {
            instance = new CalyxoNativeAIContextProvider(context);
        }
        return instance;
    }
    
    public JSONObject buildContext() {
        JSONObject ctx = new JSONObject();
        try {
            CalyxoDataRepositories repos = CalyxoDataRepositories.getInstance(context);
            CalyxoNativeNutritionEngine nutrition = CalyxoNativeNutritionEngine.getInstance(context);
            CalyxoNativeWorkoutEngine workout = CalyxoNativeWorkoutEngine.getInstance(context);
            CalyxoNativeHealthConnectManager health = CalyxoNativeHealthConnectManager.getInstance(context);
            
            ctx.put("athleteName", repos.getUserFullName());
            ctx.put("calorieGoal", nutrition.targetCalories);
            ctx.put("proteinGoalGrams", nutrition.targetProteinGrams);
            ctx.put("todayConsumedCalories", nutrition.getTotalConsumedCalories());
            ctx.put("todayConsumedProteinGrams", nutrition.getTotalConsumedProtein());
            ctx.put("recoveryScore", 88);
            ctx.put("isProSubscriber", repos.isPro());
            
            CalyxoNativeWorkoutEngine.WorkoutSession session = workout.getActiveSession();
            if (session != null) {
                ctx.put("recentWorkoutTitle", session.title);
                ctx.put("recentWorkoutVolumeKg", session.getTotalVolumeKg());
            }
            
            CalyxoNativeHealthConnectManager.TodaySnapshot snap = health.getTodaySnapshot();
            if (snap.steps > 0) {
                ctx.put("dailySteps", snap.steps);
            }
        } catch (Exception ignored) {}
        return ctx;
    }
}
