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

public class CalyxoNutritionWidgetProvider extends AppWidgetProvider {

    private static final String PREFS_NAME = "CapacitorStorage";
    private static final String WIDGET_KEY = "calyxo_widget_data";

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    public static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.calyxo_widget_nutrition);

        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String rawData = prefs.getString(WIDGET_KEY, null);

        int calories = 0;
        int calorieGoal = 2000;
        int protein = 0;
        int proteinGoal = 150;
        int carbs = 0;
        int fat = 0;

        if (rawData != null) {
            try {
                JSONObject json = new JSONObject(rawData);
                calories = json.optInt("calories", 0);
                calorieGoal = json.optInt("calorieGoal", 2000);
                protein = json.optInt("protein", 0);
                proteinGoal = json.optInt("proteinGoal", 150);
                carbs = json.optInt("carbs", 0);
                fat = json.optInt("fat", 0);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        views.setTextViewText(R.id.widget_nutrition_cals, calories + " / " + String.format("%,d", calorieGoal) + " kcal");
        views.setTextViewText(R.id.widget_protein_val, protein + "g");
        views.setTextViewText(R.id.widget_protein_lbl, "Protein (" + proteinGoal + "g)");
        views.setTextViewText(R.id.widget_carbs_val, carbs + "g");
        views.setTextViewText(R.id.widget_fat_val, fat + "g");

        // Container Launch -> Nutrition Tab
        Intent mainIntent = new Intent(context, MainActivity.class);
        mainIntent.setAction(Intent.ACTION_VIEW);
        mainIntent.setData(Uri.parse("calyxo://user/nutrition"));
        PendingIntent mainPendingIntent = PendingIntent.getActivity(
                context, 20, mainIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.widget_nutrition_container, mainPendingIntent);
        views.setOnClickPendingIntent(R.id.btn_log_food, mainPendingIntent);

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }
}
