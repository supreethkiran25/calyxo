package com.calyxo.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.widget.RemoteViews;
import org.json.JSONObject;

public class CalyxoAppWidgetProvider extends AppWidgetProvider {

    private static final String PREFS_NAME = "CapacitorStorage";
    private static final String WIDGET_KEY = "calyxo_widget_data";

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    public static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.calyxo_widget_layout);

        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String rawData = prefs.getString(WIDGET_KEY, null);

        int calories = 0;
        int calorieGoal = 2000;
        int water = 0;
        int streak = 0;
        String workoutName = "Rest & Recovery";

        if (rawData != null) {
            try {
                JSONObject json = new JSONObject(rawData);
                calories = json.optInt("calories", 0);
                calorieGoal = json.optInt("calorieGoal", 2000);
                water = json.optInt("water", 0);
                streak = json.optInt("streak", 0);
                workoutName = json.optString("activeWorkoutName", "Rest & Recovery");
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        // Update RemoteViews
        views.setTextViewText(R.id.widget_streak, "🔥 " + streak + " Day Streak");
        views.setTextViewText(R.id.widget_calories_val, calories + " / " + calorieGoal + " kcal");
        views.setTextViewText(R.id.widget_water_val, water + " ml");
        views.setTextViewText(R.id.widget_workout_status, "💪 " + workoutName);

        // General Container Launch PendingIntent
        Intent mainIntent = new Intent(context, MainActivity.class);
        mainIntent.setAction(Intent.ACTION_VIEW);
        mainIntent.setData(Uri.parse("calyxo://user/dashboard"));
        PendingIntent mainPendingIntent = PendingIntent.getActivity(
                context, 0, mainIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.widget_container, mainPendingIntent);

        // Add Water Action PendingIntent
        Intent waterIntent = new Intent(context, MainActivity.class);
        waterIntent.setAction(Intent.ACTION_VIEW);
        waterIntent.setData(Uri.parse("calyxo://water/add"));
        PendingIntent waterPendingIntent = PendingIntent.getActivity(
                context, 1, waterIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.btn_add_water, waterPendingIntent);

        // View Calories Action PendingIntent
        Intent caloriesIntent = new Intent(context, MainActivity.class);
        caloriesIntent.setAction(Intent.ACTION_VIEW);
        caloriesIntent.setData(Uri.parse("calyxo://nutrition/view"));
        PendingIntent caloriesPendingIntent = PendingIntent.getActivity(
                context, 2, caloriesIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.btn_view_calories, caloriesPendingIntent);

        // Start Workout Action PendingIntent
        Intent workoutIntent = new Intent(context, MainActivity.class);
        workoutIntent.setAction(Intent.ACTION_VIEW);
        workoutIntent.setData(Uri.parse("calyxo://workout/start"));
        PendingIntent workoutPendingIntent = PendingIntent.getActivity(
                context, 3, workoutIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.widget_workout_status, workoutPendingIntent);

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }
}
