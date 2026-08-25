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

public class CalyxoHydrationWidgetProvider extends AppWidgetProvider {

    private static final String PREFS_NAME = "CapacitorStorage";
    private static final String WIDGET_KEY = "calyxo_widget_data";

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    public static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.calyxo_widget_hydration);

        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String rawData = prefs.getString(WIDGET_KEY, null);

        int water = 0;
        int waterGoal = 3000;

        if (rawData != null) {
            try {
                JSONObject json = new JSONObject(rawData);
                water = json.optInt("water", 0);
                waterGoal = json.optInt("waterGoal", 3000);
                if (waterGoal == 2500) waterGoal = 3000;
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        int pct = waterGoal > 0 ? (int) Math.min(100, Math.round(((double) water / waterGoal) * 100)) : 0;

        views.setTextViewText(R.id.widget_hydration_val, water + " ml");
        views.setTextViewText(R.id.widget_hydration_goal, "Goal: " + String.format("%,d", waterGoal) + " ml");
        views.setTextViewText(R.id.widget_hydration_pct, pct + "%");

        // Container Launch
        Intent mainIntent = new Intent(context, MainActivity.class);
        mainIntent.setAction(Intent.ACTION_VIEW);
        mainIntent.setData(Uri.parse("calyxo://user/nutrition"));
        PendingIntent mainPendingIntent = PendingIntent.getActivity(
                context, 10, mainIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.widget_hydration_container, mainPendingIntent);

        // +250ml Action
        Intent water250Intent = new Intent(context, MainActivity.class);
        water250Intent.setAction(Intent.ACTION_VIEW);
        water250Intent.setData(Uri.parse("calyxo://water/add?amount=250"));
        PendingIntent water250PendingIntent = PendingIntent.getActivity(
                context, 11, water250Intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.btn_water_250, water250PendingIntent);

        // +500ml Action
        Intent water500Intent = new Intent(context, MainActivity.class);
        water500Intent.setAction(Intent.ACTION_VIEW);
        water500Intent.setData(Uri.parse("calyxo://water/add?amount=500"));
        PendingIntent water500PendingIntent = PendingIntent.getActivity(
                context, 12, water500Intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.btn_water_500, water500PendingIntent);

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }
}
