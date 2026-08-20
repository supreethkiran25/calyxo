package com.calyxo.app;

import android.Manifest;
import android.content.Context;
import android.content.SharedPreferences;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.os.Build;
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
    private int todayStepOffset = -1;
    private int currentHardwareSteps = 0;
    private String lastRecordedDate = "";

    private static final String HEALTH_PREFS = "CalyxoHealthPrefs";
    private static final String PREF_OFFSET_DATE = "step_offset_date";
    private static final String PREF_STEP_OFFSET = "step_offset_value";
    private static final String PREF_LAST_STEPS = "step_last_value";

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
            // New day: reset offset to current hardware count
            todayStepOffset = prefs.getInt(PREF_LAST_STEPS, 0);
            prefs.edit()
                .putString(PREF_OFFSET_DATE, today)
                .putInt(PREF_OFFSET_DATE, todayStepOffset)
                .apply();
            lastRecordedDate = today;
        } else {
            todayStepOffset = prefs.getInt(PREF_STEP_OFFSET, 0);
            lastRecordedDate = savedDate;
        }
    }

    @Override
    public void onSensorChanged(SensorEvent event) {
        if (event.sensor.getType() == Sensor.TYPE_STEP_COUNTER) {
            int totalStepsSinceBoot = (int) event.values[0];
            currentHardwareSteps = totalStepsSinceBoot;

            String today = getTodayString();
            Context context = getContext();
            SharedPreferences prefs = context.getSharedPreferences(HEALTH_PREFS, Context.MODE_PRIVATE);

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
        }
    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int accuracy) {}

    @PluginMethod
    public void isAvailable(PluginCall call) {
        boolean hasSensor = stepCounterSensor != null;
        JSObject ret = new JSObject();
        ret.put("available", true);
        ret.put("hasHardwareStepSensor", hasSensor);
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
    public void queryTodayMetrics(PluginCall call) {
        int steps = 0;
        if (currentHardwareSteps > 0 && todayStepOffset >= 0) {
            steps = Math.max(0, currentHardwareSteps - todayStepOffset);
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
        ret.put("heartRateBpm", 0);
        ret.put("restingHeartRateBpm", 0);
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
