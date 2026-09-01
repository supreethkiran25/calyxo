package com.calyxo.app.foundation.data;

import android.content.Context;
import android.os.Handler;
import android.os.Looper;
import com.calyxo.app.foundation.auth.CalyxoNativeAuthService;
import com.calyxo.app.foundation.auth.CalyxoSecureStorage;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.TimeZone;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import org.json.JSONArray;
import org.json.JSONObject;

/**
 * Native Android PostgREST Repository Layer.
 * Handles authenticated profile reads and the first native write flow: Water Logging.
 */
public final class CalyxoDataRepositories {
    private static CalyxoDataRepositories instance;
    
    private final String supabaseUrl = "https://nwcatvlfoayzrwatvyrf.supabase.co";
    private final String supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53Y2F0dmxmb2F5enJ3YXR2eXJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMjIwNDQsImV4cCI6MjA5OTU5ODA0NH0.Y0S17EapVx86R1PlEBZZDxrm12VTwYq-fm-G6BsRRLc";
    
    private final Context context;
    private final ExecutorService executor = Executors.newSingleThreadExecutor();
    private final Handler mainHandler = new Handler(Looper.getMainLooper());
    
    private int todayWaterTotalMl = 0;
    private String userFullName = "Athlete";
    private boolean isPro = false;
    
    public interface DataCallback<T> {
        void onSuccess(T result);
        void onError(String error);
    }
    
    private CalyxoDataRepositories(Context context) {
        this.context = context.getApplicationContext();
    }
    
    public static synchronized CalyxoDataRepositories getInstance(Context context) {
        if (instance == null) {
            instance = new CalyxoDataRepositories(context);
        }
        return instance;
    }
    
    public int getTodayWaterTotalMl() {
        return todayWaterTotalMl;
    }
    
    public String getUserFullName() {
        return userFullName;
    }
    
    public boolean isPro() {
        return isPro;
    }
    
    // MARK: - 1. Fetch User Profile
    public void fetchProfile(DataCallback<JSONObject> callback) {
        CalyxoNativeAuthService auth = CalyxoNativeAuthService.getInstance(context);
        CalyxoSecureStorage.StoredSession session = auth.getCurrentSession();
        if (session == null) return;
        
        executor.execute(() -> {
            try {
                URL url = new URL(supabaseUrl + "/rest/v1/user_profiles?id=eq." + session.userUUID + "&select=*");
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("GET");
                conn.setRequestProperty("apikey", supabaseAnonKey);
                conn.setRequestProperty("Authorization", "Bearer " + session.accessToken);
                
                int code = conn.getResponseCode();
                if (code >= 200 && code < 300) {
                    BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                    StringBuilder sb = new StringBuilder();
                    String line;
                    while ((line = reader.readLine()) != null) sb.append(line);
                    reader.close();
                    
                    JSONArray arr = new JSONArray(sb.toString());
                    if (arr.length() > 0) {
                        JSONObject profile = arr.getJSONObject(0);
                        String name = profile.optString("full_name", "Athlete");
                        userFullName = name;
                        mainHandler.post(() -> callback.onSuccess(profile));
                    }
                }
            } catch (Exception e) {
                mainHandler.post(() -> callback.onError(e.getMessage()));
            }
        });
    }
    
    // MARK: - 2. First Write Flow: Log Water
    public void logWater(int amountMl, DataCallback<Integer> callback) {
        CalyxoNativeAuthService auth = CalyxoNativeAuthService.getInstance(context);
        CalyxoSecureStorage.StoredSession session = auth.getCurrentSession();
        if (session == null || amountMl <= 0) return;
        
        // Optimistic local update
        todayWaterTotalMl += amountMl;
        
        executor.execute(() -> {
            try {
                URL url = new URL(supabaseUrl + "/rest/v1/water_logs");
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Content-Type", "application/json");
                conn.setRequestProperty("apikey", supabaseAnonKey);
                conn.setRequestProperty("Authorization", "Bearer " + session.accessToken);
                conn.setRequestProperty("Prefer", "return=representation");
                conn.setDoOutput(true);
                
                SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US);
                sdf.setTimeZone(TimeZone.getTimeZone("UTC"));
                String dateString = sdf.format(new Date());
                
                JSONObject payload = new JSONObject();
                payload.put("userId", session.userUUID);
                payload.put("amount_ml", amountMl);
                payload.put("logged_at", dateString);
                
                try (OutputStream os = conn.getOutputStream()) {
                    os.write(payload.toString().getBytes(StandardCharsets.UTF_8));
                }
                
                int code = conn.getResponseCode();
                if (code >= 200 && code < 300) {
                    mainHandler.post(() -> callback.onSuccess(todayWaterTotalMl));
                } else {
                    mainHandler.post(() -> callback.onError("Remote insert failed; logged locally"));
                }
            } catch (Exception e) {
                mainHandler.post(() -> callback.onError(e.getMessage()));
            }
        });
    }
}
