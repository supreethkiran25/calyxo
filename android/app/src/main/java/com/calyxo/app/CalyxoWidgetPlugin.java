package com.calyxo.app;

import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import org.json.JSONObject;

@CapacitorPlugin(name = "CalyxoWidget")
public class CalyxoWidgetPlugin extends Plugin {

    private static final String PREFS_NAME = "CapacitorStorage";
    private static final String WIDGET_KEY = "calyxo_widget_data";

    @PluginMethod
    public void syncWidgetData(PluginCall call) {
        Context context = getContext();
        try {
            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            JSONObject json = new JSONObject();

            json.put("calories", call.getInt("calories", 0));
            json.put("calorieGoal", call.getInt("calorieGoal", 2000));
            json.put("protein", call.getInt("protein", 0));
            json.put("proteinGoal", call.getInt("proteinGoal", 150));
            json.put("carbs", call.getInt("carbs", 0));
            json.put("fat", call.getInt("fat", 0));
            json.put("steps", call.getInt("steps", 0));
            json.put("water", call.getInt("water", 0));
            json.put("waterGoal", call.getInt("waterGoal", 2500));
            json.put("streak", call.getInt("streak", 0));
            json.put("activeWorkoutName", call.getString("activeWorkoutName", "Rest & Recovery"));
            json.put("updatedAt", System.currentTimeMillis());

            prefs.edit().putString(WIDGET_KEY, json.toString()).apply();

            // Trigger immediate reload of all active Android widgets
            reloadAllWidgets(context);

            JSObject ret = new JSObject();
            ret.put("success", true);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Failed to sync Android widget data: " + e.getMessage());
        }
    }

    @PluginMethod
    public void clearWidgetData(PluginCall call) {
        Context context = getContext();
        try {
            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            prefs.edit().remove(WIDGET_KEY).apply();

            reloadAllWidgets(context);

            JSObject ret = new JSObject();
            ret.put("success", true);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Failed to clear Android widget data: " + e.getMessage());
        }
    }

    @PluginMethod
    public void reloadWidgets(PluginCall call) {
        reloadAllWidgets(getContext());
        JSObject ret = new JSObject();
        ret.put("success", true);
        call.resolve(ret);
    }

    private void reloadAllWidgets(Context context) {
        AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
        ComponentName thisWidget = new ComponentName(context, CalyxoAppWidgetProvider.class);
        int[] appWidgetIds = appWidgetManager.getAppWidgetIds(thisWidget);

        if (appWidgetIds != null && appWidgetIds.length > 0) {
            Intent intent = new Intent(context, CalyxoAppWidgetProvider.class);
            intent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
            intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, appWidgetIds);
            context.sendBroadcast(intent);
        }
    }
}
