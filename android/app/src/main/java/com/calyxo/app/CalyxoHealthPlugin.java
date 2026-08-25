package com.calyxo.app;

import android.Manifest;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

@CapacitorPlugin(
    name = "CalyxoHealthPlugin",
    permissions = {
        @Permission(
            strings = {
                Manifest.permission.ACTIVITY_RECOGNITION,
                Manifest.permission.BODY_SENSORS
            },
            alias = "health"
        )
    }
)
public class CalyxoHealthPlugin extends Plugin implements SensorEventListener {

    private SensorManager sensorManager;
    private Sensor stepCounterSensor;
    private Sensor stepDetectorSensor;
    private Sensor heartRateSensor;

    private int todayStepOffset = -1;
    private int currentHardwareSteps = 0;
    private int detectorStepsToday = 0;
    private int latestHeartRateBpm = 0;
    private String lastRecordedDate = "";

    private static final String HEALTH_PREFS = "CalyxoHealthPrefs";
    private static final String PREF_OFFSET_DATE = "step_offset_date";
    private static final String PREF_STEP_OFFSET = "step_offset_value";
    private static final String PREF_LAST_STEPS = "step_last_value";
    private static final String PREF_DETECTOR_STEPS = "step_detector_value";

    @Override
    public void load() {
        super.load();
        Context context = getContext();
        sensorManager = (SensorManager) context.getSystemService(Context.SENSOR_SERVICE);
        if (sensorManager != null) {
            stepCounterSensor = sensorManager.getDefaultSensor(Sensor.TYPE_STEP_COUNTER);
            if (stepCounterSensor != null) {
                sensorManager.registerListener(this, stepCounterSensor, SensorManager.SENSOR_DELAY_UI);
            }

            stepDetectorSensor = sensorManager.getDefaultSensor(Sensor.TYPE_STEP_DETECTOR);
            if (stepDetectorSensor != null) {
                sensorManager.registerListener(this, stepDetectorSensor, SensorManager.SENSOR_DELAY_UI);
            }

            heartRateSensor = sensorManager.getDefaultSensor(Sensor.TYPE_HEART_RATE);
            if (heartRateSensor != null) {
                sensorManager.registerListener(this, heartRateSensor, SensorManager.SENSOR_DELAY_NORMAL);
            }
        }
        loadDailyOffset();
    }

    private String getTodayString() {
        return new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(new Date());
    }

    private void loadDailyOffset() {
        Context context = getContext();
        SharedPreferences prefs = context.getSharedPreferences(HEALTH_PREFS, Context.MODE_PRIVATE);
        String today = getTodayString();
        String savedDate = prefs.getString(PREF_OFFSET_DATE, "");

        if (!today.equals(savedDate)) {
            todayStepOffset = prefs.getInt(PREF_LAST_STEPS, 0);
            detectorStepsToday = 0;
            prefs.edit()
                .putString(PREF_OFFSET_DATE, today)
                .putInt(PREF_STEP_OFFSET, todayStepOffset)
                .putInt(PREF_DETECTOR_STEPS, 0)
                .apply();
            lastRecordedDate = today;
        } else {
            todayStepOffset = prefs.getInt(PREF_STEP_OFFSET, 0);
            detectorStepsToday = prefs.getInt(PREF_DETECTOR_STEPS, 0);
            lastRecordedDate = savedDate;
        }
    }

    @Override
    public void onSensorChanged(SensorEvent event) {
        String today = getTodayString();
        Context context = getContext();
        SharedPreferences prefs = context.getSharedPreferences(HEALTH_PREFS, Context.MODE_PRIVATE);

        if (event.sensor.getType() == Sensor.TYPE_STEP_COUNTER) {
            int totalStepsSinceBoot = (int) event.values[0];
            currentHardwareSteps = totalStepsSinceBoot;

            if (!today.equals(lastRecordedDate) || todayStepOffset < 0) {
                todayStepOffset = totalStepsSinceBoot;
                lastRecordedDate = today;
                prefs.edit()
                    .putString(PREF_OFFSET_DATE, today)
                    .putInt(PREF_STEP_OFFSET, todayStepOffset)
                    .putInt(PREF_LAST_STEPS, totalStepsSinceBoot)
                    .apply();
            } else {
                prefs.edit().putInt(PREF_LAST_STEPS, totalStepsSinceBoot).apply();
            }
        } else if (event.sensor.getType() == Sensor.TYPE_STEP_DETECTOR) {
            if (event.values[0] == 1.0f) {
                detectorStepsToday++;
                prefs.edit().putInt(PREF_DETECTOR_STEPS, detectorStepsToday).apply();
            }
        } else if (event.sensor.getType() == Sensor.TYPE_HEART_RATE) {
            int hr = (int) event.values[0];
            if (hr > 30 && hr < 240) {
                latestHeartRateBpm = hr;
            }
        }

        try {
            int currentSteps = 0;
            if (currentHardwareSteps > 0 && todayStepOffset >= 0) {
                currentSteps = Math.max(0, currentHardwareSteps - todayStepOffset);
            } else if (detectorStepsToday > 0) {
                currentSteps = detectorStepsToday;
            }
            if (currentSteps > 0) {
                SharedPreferences widgetPrefs = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
                String raw = widgetPrefs.getString("calyxo_widget_data", null);
                org.json.JSONObject obj = raw != null ? new org.json.JSONObject(raw) : new org.json.JSONObject();
                obj.put("steps", currentSteps);
                widgetPrefs.edit().putString("calyxo_widget_data", obj.toString()).apply();
            }
        } catch (Exception ignored) {}
    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int accuracy) {}

    @PluginMethod
    public void isAvailable(PluginCall call) {
        boolean hasCounter = stepCounterSensor != null;
        boolean hasDetector = stepDetectorSensor != null;
        JSObject ret = new JSObject();
        ret.put("available", true);
        ret.put("hasHardwareStepSensor", hasCounter || hasDetector);
        ret.put("hasHeartRateSensor", heartRateSensor != null);
        call.resolve(ret);
    }

    @PluginMethod
    public void requestPermissions(PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            if (getPermissionState("health") != com.getcapacitor.PermissionState.GRANTED) {
                requestPermissionForAlias("health", call, "permissionCallback");
                return;
            }
        }
        JSObject ret = new JSObject();
        ret.put("granted", true);
        ret.put("status", "authorized");
        call.resolve(ret);
    }

    @PermissionCallback
    private void permissionCallback(PluginCall call) {
        boolean granted = getPermissionState("health") == com.getcapacitor.PermissionState.GRANTED;
        JSObject ret = new JSObject();
        ret.put("granted", granted);
        ret.put("status", granted ? "authorized" : "denied");
        call.resolve(ret);
    }

    @PluginMethod
    public void openSettings(PluginCall call) {
        try {
            Context context = getContext();
            Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
            Uri uri = Uri.fromParts("package", context.getPackageName(), null);
            intent.setData(uri);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            context.startActivity(intent);
            JSObject ret = new JSObject();
            ret.put("opened", true);
            ret.put("target", "app_details");
            call.resolve(ret);
        } catch (Exception e) {
            JSObject ret = new JSObject();
            ret.put("opened", false);
            ret.put("error", e.getMessage());
            call.resolve(ret);
        }
    }

    @PluginMethod
    public void openHealthSettings(PluginCall call) {
        Context context = getContext();
        try {
            Intent healthConnectIntent = new Intent("androidx.health.ACTION_HEALTH_CONNECT_SETTINGS");
            healthConnectIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            if (healthConnectIntent.resolveActivity(context.getPackageManager()) != null) {
                context.startActivity(healthConnectIntent);
                JSObject ret = new JSObject();
                ret.put("opened", true);
                ret.put("target", "health_connect");
                call.resolve(ret);
                return;
            }
        } catch (Exception ignored) {}

        try {
            Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
            Uri uri = Uri.fromParts("package", context.getPackageName(), null);
            intent.setData(uri);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            context.startActivity(intent);
            JSObject ret = new JSObject();
            ret.put("opened", true);
            ret.put("target", "app_details");
            call.resolve(ret);
        } catch (Exception e) {
            JSObject ret = new JSObject();
            ret.put("opened", false);
            ret.put("error", e.getMessage());
            call.resolve(ret);
        }
    }

    @PluginMethod
    public void openBluetoothSettings(PluginCall call) {
        try {
            Context context = getContext();
            Intent intent = new Intent(Settings.ACTION_BLUETOOTH_SETTINGS);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            context.startActivity(intent);
            JSObject ret = new JSObject();
            ret.put("opened", true);
            call.resolve(ret);
        } catch (Exception e) {
            JSObject ret = new JSObject();
            ret.put("opened", false);
            ret.put("error", e.getMessage());
            call.resolve(ret);
        }
    }

    @PluginMethod
    public void activateHealthSource(PluginCall call) {
        loadDailyOffset();
        JSObject ret = new JSObject();
        ret.put("activated", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void saveWorkout(PluginCall call) {
        double calories = call.getDouble("calories", 0.0);
        String type = call.getString("type", "Workout");
        
        Context context = getContext();
        SharedPreferences prefs = context.getSharedPreferences(HEALTH_PREFS, Context.MODE_PRIVATE);
        int currentWorkouts = prefs.getInt("calyxo_logged_workouts_count", 0);
        prefs.edit().putInt("calyxo_logged_workouts_count", currentWorkouts + 1).apply();

        JSObject ret = new JSObject();
        ret.put("saved", true);
        ret.put("type", type);
        ret.put("calories", calories);
        call.resolve(ret);
    }

    @PluginMethod
    public void saveWeight(PluginCall call) {
        double weightKg = call.getDouble("weightKg", 0.0);
        Context context = getContext();
        SharedPreferences prefs = context.getSharedPreferences(HEALTH_PREFS, Context.MODE_PRIVATE);
        prefs.edit().putFloat("calyxo_logged_weight_kg", (float) weightKg).apply();

        JSObject ret = new JSObject();
        ret.put("saved", true);
        ret.put("weightKg", weightKg);
        call.resolve(ret);
    }

    @PluginMethod
    public void saveWater(PluginCall call) {
        double ml = call.getDouble("milliliters", 0.0);
        Context context = getContext();
        SharedPreferences prefs = context.getSharedPreferences(HEALTH_PREFS, Context.MODE_PRIVATE);
        float currentWater = prefs.getFloat("calyxo_logged_water_ml", 0f);
        prefs.edit().putFloat("calyxo_logged_water_ml", (float) (currentWater + ml)).apply();

        JSObject ret = new JSObject();
        ret.put("saved", true);
        ret.put("totalWaterMl", currentWater + ml);
        call.resolve(ret);
    }

    @PluginMethod
    public void queryTodayMetrics(PluginCall call) {
        int steps = 0;
        if (currentHardwareSteps > 0 && todayStepOffset >= 0) {
            steps = Math.max(0, currentHardwareSteps - todayStepOffset);
        } else if (detectorStepsToday > 0) {
            steps = detectorStepsToday;
        }

        double distanceKm = (steps > 0) ? Math.round((steps * 0.000762) * 100.0) / 100.0 : 0.0;
        int activeCalories = (steps > 0) ? (int) Math.round(steps * 0.04) : 0;
        int activeMinutes = (steps > 0) ? Math.round(steps / 115) : 0;

        JSObject ret = new JSObject();
        ret.put("steps", steps);
        ret.put("stepGoal", 10000);
        ret.put("distanceKm", distanceKm);
        ret.put("activeCalories", activeCalories);
        ret.put("calorieGoal", 500);
        ret.put("activeMinutes", activeMinutes);
        ret.put("activeMinutesGoal", 60);
        ret.put("heartRateBpm", latestHeartRateBpm);
        ret.put("restingHeartRateBpm", latestHeartRateBpm > 0 ? latestHeartRateBpm - 5 : 0);
        ret.put("sleepHours", 0.0);
        ret.put("weightKg", 0.0);
        ret.put("bodyFatPct", 0.0);
        ret.put("lastSyncTimestamp", System.currentTimeMillis());

        call.resolve(ret);
    }

    @PluginMethod
    public void queryRecentWorkouts(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("workouts", new JSArray());
        call.resolve(ret);
    }
}
