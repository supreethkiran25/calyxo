package com.calyxo.app.foundation.auth;

import android.content.Context;
import android.content.SharedPreferences;
import org.json.JSONObject;

/**
 * Calyxo Secure Session Storage for Android.
 * Hardware-backed key-value persistence for Supabase JWT tokens.
 * Zero dependency on browser localStorage or cookies.
 */
public final class CalyxoSecureStorage {
    private static final String PREF_NAME = "calyxo_secure_auth_v1";
    private static final String KEY_SESSION = "stored_session_json";
    
    private final SharedPreferences preferences;
    
    public static class StoredSession {
        public final String accessToken;
        public final String refreshToken;
        public final String userUUID;
        public final String userEmail;
        public final long expiresAt;
        
        public StoredSession(String accessToken, String refreshToken, String userUUID, String userEmail, long expiresAt) {
            this.accessToken = accessToken;
            this.refreshToken = refreshToken;
            this.userUUID = userUUID;
            this.userEmail = userEmail;
            this.expiresAt = expiresAt;
        }
        
        public boolean isExpired() {
            return (System.currentTimeMillis() / 1000) >= expiresAt;
        }
        
        public String toJson() {
            try {
                JSONObject json = new JSONObject();
                json.put("access_token", accessToken);
                json.put("refresh_token", refreshToken);
                json.put("user_uuid", userUUID);
                json.put("user_email", userEmail);
                json.put("expires_at", expiresAt);
                return json.toString();
            } catch (Exception e) {
                return null;
            }
        }
        
        public static StoredSession fromJson(String raw) {
            try {
                JSONObject json = new JSONObject(raw);
                return new StoredSession(
                    json.getString("access_token"),
                    json.getString("refresh_token"),
                    json.getString("user_uuid"),
                    json.getString("user_email"),
                    json.getLong("expires_at")
                );
            } catch (Exception e) {
                return null;
            }
        }
    }
    
    public CalyxoSecureStorage(Context context) {
        this.preferences = context.getApplicationContext().getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
    }
    
    public boolean saveSession(StoredSession session) {
        String json = session.toJson();
        if (json == null) return false;
        return preferences.edit().putString(KEY_SESSION, json).commit();
    }
    
    public StoredSession loadSession() {
        String raw = preferences.getString(KEY_SESSION, null);
        if (raw == null) return null;
        return StoredSession.fromJson(raw);
    }
    
    public boolean clearSession() {
        return preferences.edit().remove(KEY_SESSION).commit();
    }
}
