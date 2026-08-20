package com.calyxo.app;

import android.appwidget.AppWidgetManager;
import android.content.BroadcastReceiver;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.SharedPreferences;
import android.media.AudioManager;
import android.os.Build;
import android.os.SystemClock;
import android.view.KeyEvent;
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

    private static String lastTrackTitle = "";
    private static String lastArtistName = "";
    private static String lastAlbumName = "";
    private static String lastMusicApp = "Media Player";
    private static boolean isPlayingState = false;

    private BroadcastReceiver mediaReceiver;

    @Override
    public void load() {
        super.load();
        registerMediaReceiver();
    }

    private void registerMediaReceiver() {
        if (mediaReceiver != null) return;
        mediaReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                String action = intent.getAction();
                if (action == null) return;

                if (action.contains("spotify")) {
                    lastMusicApp = "Spotify";
                } else if (action.contains("apple")) {
                    lastMusicApp = "Apple Music";
                } else {
                    lastMusicApp = "Music Player";
                }

                String track = intent.getStringExtra("track");
                if (track == null) track = intent.getStringExtra("track_name");
                if (track == null) track = intent.getStringExtra("title");
                if (track != null && !track.trim().isEmpty()) {
                    lastTrackTitle = track.trim();
                }

                String artist = intent.getStringExtra("artist");
                if (artist == null) artist = intent.getStringExtra("artist_name");
                if (artist != null && !artist.trim().isEmpty()) {
                    lastArtistName = artist.trim();
                }

                String album = intent.getStringExtra("album");
                if (album == null) album = intent.getStringExtra("album_name");
                if (album != null && !album.trim().isEmpty()) {
                    lastAlbumName = album.trim();
                }

                if (intent.hasExtra("playing")) {
                    isPlayingState = intent.getBooleanExtra("playing", false);
                }
            }
        };

        IntentFilter filter = new IntentFilter();
        filter.addAction("com.spotify.music.metadatachanged");
        filter.addAction("com.spotify.music.playbackstatechanged");
        filter.addAction("com.android.music.metachanged");
        filter.addAction("com.android.music.playstatechanged");
        filter.addAction("com.apple.android.music.metachanged");
        filter.addAction("com.htc.music.metachanged");
        filter.addAction("com.amazon.mp3.metachanged");

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                getContext().registerReceiver(mediaReceiver, filter, Context.RECEIVER_EXPORTED);
            } else {
                getContext().registerReceiver(mediaReceiver, filter);
            }
        } catch (Exception ignored) {}
    }

    @PluginMethod
    public void getNowPlayingMedia(PluginCall call) {
        AudioManager audioManager = (AudioManager) getContext().getSystemService(Context.AUDIO_SERVICE);
        boolean isMusicActive = audioManager != null && audioManager.isMusicActive();

        JSObject ret = new JSObject();
        ret.put("isPlaying", isMusicActive || isPlayingState);
        ret.put("title", lastTrackTitle);
        ret.put("artist", lastArtistName);
        ret.put("album", lastAlbumName);
        ret.put("app", lastMusicApp);
        call.resolve(ret);
    }

    @PluginMethod
    public void sendMediaCommand(PluginCall call) {
        String action = call.getString("action", "toggle");
        AudioManager audioManager = (AudioManager) getContext().getSystemService(Context.AUDIO_SERVICE);
        if (audioManager == null) {
            call.reject("Audio manager unavailable");
            return;
        }

        int keycode = KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE;
        if ("next".equalsIgnoreCase(action)) {
            keycode = KeyEvent.KEYCODE_MEDIA_NEXT;
        } else if ("prev".equalsIgnoreCase(action) || "previous".equalsIgnoreCase(action)) {
            keycode = KeyEvent.KEYCODE_MEDIA_PREVIOUS;
        } else if ("play".equalsIgnoreCase(action)) {
            keycode = KeyEvent.KEYCODE_MEDIA_PLAY;
        } else if ("pause".equalsIgnoreCase(action)) {
            keycode = KeyEvent.KEYCODE_MEDIA_PAUSE;
        }

        long eventtime = SystemClock.uptimeMillis();
        audioManager.dispatchMediaKeyEvent(new KeyEvent(eventtime, eventtime, KeyEvent.ACTION_DOWN, keycode, 0));
        audioManager.dispatchMediaKeyEvent(new KeyEvent(eventtime, eventtime, KeyEvent.ACTION_UP, keycode, 0));

        JSObject ret = new JSObject();
        ret.put("success", true);
        ret.put("dispatched", action);
        call.resolve(ret);
    }

    @PluginMethod
    public void isMusicPlaying(PluginCall call) {
        AudioManager audioManager = (AudioManager) getContext().getSystemService(Context.AUDIO_SERVICE);
        boolean isPlaying = audioManager != null && audioManager.isMusicActive();
        JSObject ret = new JSObject();
        ret.put("isPlaying", isPlaying);
        call.resolve(ret);
    }

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

    @PluginMethod
    public void pinWidget(PluginCall call) {
        Context context = getContext();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
            ComponentName myProvider = new ComponentName(context, CalyxoAppWidgetProvider.class);

            if (appWidgetManager.isRequestPinAppWidgetSupported()) {
                Intent pinnedWidgetCallbackIntent = new Intent(context, CalyxoAppWidgetProvider.class);
                pinnedWidgetCallbackIntent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
                android.app.PendingIntent successCallback = android.app.PendingIntent.getBroadcast(
                    context, 0, pinnedWidgetCallbackIntent,
                    android.app.PendingIntent.FLAG_UPDATE_CURRENT | android.app.PendingIntent.FLAG_IMMUTABLE
                );

                appWidgetManager.requestPinAppWidget(myProvider, null, successCallback);
                JSObject ret = new JSObject();
                ret.put("success", true);
                ret.put("supported", true);
                call.resolve(ret);
                return;
            }
        }
        JSObject ret = new JSObject();
        ret.put("success", false);
        ret.put("supported", false);
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

            try {
                Intent miuiIntent = new Intent("com.miui.home.action.APPWIDGET_UPDATE");
                miuiIntent.setComponent(thisWidget);
                miuiIntent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, appWidgetIds);
                context.sendBroadcast(miuiIntent);
            } catch (Exception ignored) {}
        }
    }
}
