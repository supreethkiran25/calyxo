package com.calyxo.app.foundation.auth;

import android.content.Context;
import android.os.Handler;
import android.os.Looper;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import org.json.JSONObject;

/**
 * Native Supabase GoTrue authentication client for Android.
 * Connects directly to the existing Supabase backend.
 */
public final class CalyxoNativeAuthService {
    private static CalyxoNativeAuthService instance;
    
    private final String supabaseUrl = "https://nwcatvlfoayzrwatvyrf.supabase.co";
    private final String supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53Y2F0dmxmb2F5enJ3YXR2eXJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMjIwNDQsImV4cCI6MjA5OTU5ODA0NH0.Y0S17EapVx86R1PlEBZZDxrm12VTwYq-fm-G6BsRRLc";
    
    private final CalyxoSecureStorage storage;
    private final ExecutorService executor = Executors.newSingleThreadExecutor();
    private final Handler mainHandler = new Handler(Looper.getMainLooper());
    
    private CalyxoSecureStorage.StoredSession currentSession;
    
    public interface AuthCallback {
        void onSuccess(CalyxoSecureStorage.StoredSession session);
        void onError(String errorMessage);
    }
    
    private CalyxoNativeAuthService(Context context) {
        this.storage = new CalyxoSecureStorage(context);
        this.currentSession = storage.loadSession();
    }
    
    public static synchronized CalyxoNativeAuthService getInstance(Context context) {
        if (instance == null) {
            instance = new CalyxoNativeAuthService(context);
        }
        return instance;
    }
    
    public boolean isAuthenticated() {
        return currentSession != null && !currentSession.isExpired();
    }
    
    public CalyxoSecureStorage.StoredSession getCurrentSession() {
        return currentSession;
    }
    
    public void signIn(String email, String password, AuthCallback callback) {
        executor.execute(() -> {
            try {
                URL url = new URL(supabaseUrl + "/auth/v1/token?grant_type=password");
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Content-Type", "application/json");
                conn.setRequestProperty("apikey", supabaseAnonKey);
                conn.setRequestProperty("Authorization", "Bearer " + supabaseAnonKey);
                conn.setDoOutput(true);
                
                JSONObject payload = new JSONObject();
                payload.put("email", email.trim());
                payload.put("password", password);
                
                try (OutputStream os = conn.getOutputStream()) {
                    os.write(payload.toString().getBytes(StandardCharsets.UTF_8));
                }
                
                int responseCode = conn.getResponseCode();
                BufferedReader reader = new BufferedReader(new InputStreamReader(
                    responseCode >= 200 && responseCode < 300 ? conn.getInputStream() : conn.getErrorStream()
                ));
                
                StringBuilder sb = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    sb.append(line);
                }
                reader.close();
                
                JSONObject resJson = new JSONObject(sb.toString());
                if (responseCode >= 200 && responseCode < 300) {
                    String accessToken = resJson.getString("access_token");
                    String refreshToken = resJson.getString("refresh_token");
                    long expiresIn = resJson.optLong("expires_in", 3600);
                    JSONObject userObj = resJson.getJSONObject("user");
                    String userUUID = userObj.getString("id");
                    String userEmail = userObj.optString("email", email);
                    long expiresAt = (System.currentTimeMillis() / 1000) + expiresIn;
                    
                    CalyxoSecureStorage.StoredSession session = new CalyxoSecureStorage.StoredSession(
                        accessToken, refreshToken, userUUID, userEmail, expiresAt
                    );
                    storage.saveSession(session);
                    currentSession = session;
                    
                    mainHandler.post(() -> callback.onSuccess(session));
                } else {
                    String errorMsg = resJson.optString("error_description", resJson.optString("msg", "Authentication failed"));
                    mainHandler.post(() -> callback.onError(errorMsg));
                }
            } catch (Exception e) {
                mainHandler.post(() -> callback.onError(e.getMessage()));
            }
        });
    }
    
    public void signOut() {
        storage.clearSession();
        currentSession = null;
    }
}
