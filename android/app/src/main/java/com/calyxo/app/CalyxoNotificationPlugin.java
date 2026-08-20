package com.calyxo.app;

import android.Manifest;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

@CapacitorPlugin(
    name = "CalyxoNotification",
    permissions = {
        @Permission(
            strings = { Manifest.permission.POST_NOTIFICATIONS },
            alias = "notifications"
        )
    }
)
public class CalyxoNotificationPlugin extends Plugin {

    private static final String CHANNEL_ID_WORKOUT = "calyxo_live_workout_channel";
    private static final String CHANNEL_ID_GENERAL = "calyxo_general_channel";

    @Override
    public void load() {
        super.load();
        createNotificationChannels();
    }

    private void createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            Context context = getContext();
            NotificationManager manager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
            if (manager != null) {
                // 1. Live Workout & Rest Channel (High Importance, Ongoing, Heads-Up)
                NotificationChannel workoutChannel = new NotificationChannel(
                    CHANNEL_ID_WORKOUT,
                    "Calyxo Live Workout & Rest Activity",
                    NotificationManager.IMPORTANCE_HIGH
                );
                workoutChannel.setDescription("Live ongoing workout sets, elapsed timer, and rest countdowns");
                workoutChannel.enableVibration(true);
                workoutChannel.setShowBadge(true);
                workoutChannel.setLockscreenVisibility(NotificationCompat.VISIBILITY_PUBLIC);
                manager.createNotificationChannel(workoutChannel);

                // 2. General Alerts & Reminders Channel
                NotificationChannel generalChannel = new NotificationChannel(
                    CHANNEL_ID_GENERAL,
                    "Calyxo Daily Reminders",
                    NotificationManager.IMPORTANCE_DEFAULT
                );
                generalChannel.setDescription("Hydration and workout reminders");
                manager.createNotificationChannel(generalChannel);
            }
        }
    }

    @PluginMethod
    public void getPermissionStatus(PluginCall call) {
        JSObject ret = new JSObject();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            boolean granted = getPermissionState("notifications") == com.getcapacitor.PermissionState.GRANTED;
            ret.put("status", granted ? "authorized" : "denied");
            ret.put("isRegistered", granted);
        } else {
            boolean enabled = NotificationManagerCompat.from(getContext()).areNotificationsEnabled();
            ret.put("status", enabled ? "authorized" : "denied");
            ret.put("isRegistered", enabled);
        }
        call.resolve(ret);
    }

    @PluginMethod
    public void requestPermissions(PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (getPermissionState("notifications") != com.getcapacitor.PermissionState.GRANTED) {
                requestPermissionForAlias("notifications", call, "permissionCallback");
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
        boolean granted = getPermissionState("notifications") == com.getcapacitor.PermissionState.GRANTED;
        JSObject ret = new JSObject();
        ret.put("granted", granted);
        ret.put("status", granted ? "authorized" : "denied");
        call.resolve(ret);
    }

    @PluginMethod
    public void scheduleLocalNotification(PluginCall call) {
        String title = call.getString("title", "Calyxo Workout");
        String body = call.getString("body", "");
        String idStr = call.getString("id", "calyxo_workout");
        boolean isOngoing = call.getBoolean("isOngoing", false) || idStr.contains("live") || idStr.contains("workout");

        int notifId = Math.abs(idStr.hashCode());
        Context context = getContext();

        // Ensure channels are active
        createNotificationChannels();

        Intent intent = new Intent(context, MainActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            flags |= PendingIntent.FLAG_IMMUTABLE;
        }
        PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, intent, flags);

        String channelId = isOngoing ? CHANNEL_ID_WORKOUT : CHANNEL_ID_GENERAL;

        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, channelId)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle(title)
            .setContentText(body)
            .setPriority(isOngoing ? NotificationCompat.PRIORITY_HIGH : NotificationCompat.PRIORITY_DEFAULT)
            .setCategory(isOngoing ? NotificationCompat.CATEGORY_WORKOUT : NotificationCompat.CATEGORY_REMINDER)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setContentIntent(pendingIntent)
            .setAutoCancel(!isOngoing)
            .setOngoing(isOngoing)
            .setOnlyAlertOnce(isOngoing);

        if (isOngoing) {
            builder.setStyle(new NotificationCompat.BigTextStyle().bigText(body));
        }

        try {
            NotificationManagerCompat.from(context).notify(notifId, builder.build());
            JSObject res = new JSObject();
            res.put("success", true);
            res.put("notificationId", notifId);
            call.resolve(res);
        } catch (SecurityException e) {
            call.reject("Notification permission not granted: " + e.getMessage());
        } catch (Exception e) {
            call.reject("Failed to post Android notification: " + e.getMessage());
        }
    }

    @PluginMethod
    public void cancelLocalNotification(PluginCall call) {
        String idStr = call.getString("id", "");
        if (!idStr.isEmpty()) {
            int notifId = Math.abs(idStr.hashCode());
            NotificationManagerCompat.from(getContext()).cancel(notifId);
        }
        JSObject res = new JSObject();
        res.put("success", true);
        call.resolve(res);
    }
}
