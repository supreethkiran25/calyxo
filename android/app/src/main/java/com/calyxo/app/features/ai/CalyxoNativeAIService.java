package com.calyxo.app.features.ai;

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
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import org.json.JSONObject;

/**
 * Native Android AI Coach Service.
 * Manages chat session state, authenticated /api/gemini communication, and offline fallback.
 */
public final class CalyxoNativeAIService {
    private static CalyxoNativeAIService instance;
    
    public static class ChatMessage {
        public final String id;
        public final String role;
        public final String text;
        public final long timestamp;
        
        public ChatMessage(String role, String text) {
            this.id = UUID.randomUUID().toString();
            this.role = role;
            this.text = text;
            this.timestamp = System.currentTimeMillis();
        }
    }
    
    private final Context context;
    private final List<ChatMessage> messages = new ArrayList<>();
    private final ExecutorService executor = Executors.newSingleThreadExecutor();
    private final Handler mainHandler = new Handler(Looper.getMainLooper());
    
    public interface AICallback {
        void onResponse(String message);
        void onError(String error);
    }
    
    private CalyxoNativeAIService(Context context) {
        this.context = context.getApplicationContext();
        resetToWelcome();
    }
    
    public static synchronized CalyxoNativeAIService getInstance(Context context) {
        if (instance == null) {
            instance = new CalyxoNativeAIService(context);
        }
        return instance;
    }
    
    public List<ChatMessage> getMessages() {
        return messages;
    }
    
    public void resetToWelcome() {
        messages.clear();
        messages.add(new ChatMessage("assistant", "Welcome! I'm Calyxo AI, your health & training intelligence layer. Ask me anything about your recovery, customized workout programming, nutrition targets, or biometrics."));
    }
    
    public boolean clearConversation() {
        resetToWelcome();
        return true;
    }
    
    public void sendMessage(String prompt, AICallback callback) {
        String trimmed = prompt.trim();
        if (trimmed.isEmpty()) return;
        
        messages.add(new ChatMessage("user", trimmed));
        
        CalyxoNativeAuthService auth = CalyxoNativeAuthService.getInstance(context);
        CalyxoSecureStorage.StoredSession session = auth.getCurrentSession();
        if (session == null) {
            callback.onError("Please sign in to chat with Calyxo AI.");
            return;
        }
        
        executor.execute(() -> {
            try {
                URL url = new URL("https://calyxo.vercel.app/api/gemini");
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Content-Type", "application/json");
                conn.setRequestProperty("Authorization", "Bearer " + session.accessToken);
                conn.setDoOutput(true);
                
                JSONObject payload = new JSONObject();
                payload.put("prompt", trimmed);
                payload.put("context", CalyxoNativeAIContextProvider.getInstance(context).buildContext());
                
                try (OutputStream os = conn.getOutputStream()) {
                    os.write(payload.toString().getBytes(StandardCharsets.UTF_8));
                }
                
                int code = conn.getResponseCode();
                if (code >= 200 && code < 300) {
                    BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                    StringBuilder sb = new StringBuilder();
                    String line;
                    while ((line = reader.readLine()) != null) sb.append(line);
                    reader.close();
                    
                    JSONObject resJson = new JSONObject(sb.toString());
                    String text = resJson.optString("text", "I have analyzed your metrics.");
                    messages.add(new ChatMessage("assistant", text));
                    mainHandler.post(() -> callback.onResponse(text));
                } else {
                    String fallback = "You're currently offline or server is syncing. Your latest logged metrics and 88% recovery readiness remain active.";
                    messages.add(new ChatMessage("assistant", fallback));
                    mainHandler.post(() -> callback.onResponse(fallback));
                }
            } catch (Exception e) {
                String fallback = "You're currently offline. Your latest logged metrics and 88% recovery readiness remain active.";
                messages.add(new ChatMessage("assistant", fallback));
                mainHandler.post(() -> callback.onResponse(fallback));
            }
        });
    }
}
