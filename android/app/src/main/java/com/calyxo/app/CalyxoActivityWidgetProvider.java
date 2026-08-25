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

public class CalyxoActivityWidgetProvider extends AppWidgetProvider {

    private static final String PREFS_NAME = "CapacitorStorage";
    private static final String WIDGET_KEY = "calyxo_widget_data";

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    public static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.calyxo_widget_activity);

        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String rawData = prefs.getString(WIDGET_KEY, null);

        int steps = 0;
        int stepGoal = 10000;
        int streak = 0;
        String workoutName = "Rest & Recovery";

        if (rawData != null) {
            try {
                JSONObject json = new JSONObject(rawData);
                steps = json.optInt("steps", 0);
                stepGoal = json.optInt("stepGoal", 10000);
                streak = json.optInt("streak", 0);
                workoutName = json.optString("activeWorkoutName", "Rest & Recovery");
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        views.setTextViewText(R.id.widget_activity_steps, String.format("%,d", steps));
        views.setTextViewText(R.id.widget_activity_step_goal, "Goal: " + String.format("%,d", stepGoal) + " steps");
        views.setTextViewText(R.id.widget_activity_streak, "🔥 " + streak + " Days");

        if (workoutName != null && !workoutName.isEmpty() && !workoutName.equalsIgnoreCase("Rest & Recovery")) {
            views.setTextViewText(R.id.btn_activity_workout, "💪 " + workoutName);
        } else {
            views.setTextViewText(R.id.btn_activity_workout, "💪 Start Workout");
        }

        // Container Launch -> Activity / Workout page
        Intent mainIntent = new Intent(context, MainActivity.class);
        mainIntent.setAction(Intent.ACTION_VIEW);
        mainIntent.setData(Uri.parse("calyxo://user/workout"));
        PendingIntent mainPendingIntent = PendingIntent.getActivity(
                context, 30, mainIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.widget_activity_container, mainPendingIntent);

        // Start Workout Action
        Intent workoutIntent = new Intent(context, MainActivity.class);
        workoutIntent.setAction(Intent.ACTION_VIEW);
        workoutIntent.setData(Uri.parse("calyxo://workout/start"));
        PendingIntent workoutPendingIntent = PendingIntent.getActivity(
                context, 31, workoutIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.btn_activity_workout, workoutPendingIntent);

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }
}
