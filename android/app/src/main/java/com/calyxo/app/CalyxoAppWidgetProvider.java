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

        // Read real widget payload written by Capacitor Preferences
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

        // Deep Link PendingIntent to open MainActivity cleanly
        Intent launchIntent = new Intent(context, MainActivity.class);
        launchIntent.setAction(Intent.ACTION_VIEW);
        launchIntent.setData(Uri.parse("com.supreethkiran.calyxo://auth/callback"));
        PendingIntent pendingIntent = PendingIntent.getActivity(
                context, 0, launchIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        views.setOnClickPendingIntent(R.id.widget_container, pendingIntent);

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }
}
