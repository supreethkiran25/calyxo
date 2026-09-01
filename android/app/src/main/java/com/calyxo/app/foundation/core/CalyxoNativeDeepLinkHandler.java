package com.calyxo.app.foundation.core;

import android.net.Uri;

/**
 * Native Deep-Link and Notification Action router for Android.
 */
public final class CalyxoNativeDeepLinkHandler {
    public enum Route {
        DASHBOARD,
        WORKOUT,
        NUTRITION,
        HEALTH,
        AUTH_CALLBACK,
        QUICK_HYDRATE,
        UNKNOWN
    }
    
    public static class DeepLinkResult {
        public final Route route;
        public final String authCode;
        public final String accessToken;
        public final int hydrateAmountMl;
        
        public DeepLinkResult(Route route, String authCode, String accessToken, int hydrateAmountMl) {
            this.route = route;
            this.authCode = authCode;
            this.accessToken = accessToken;
            this.hydrateAmountMl = hydrateAmountMl;
        }
    }
    
    public static DeepLinkResult parse(Uri uri) {
        if (uri == null) {
            return new DeepLinkResult(Route.DASHBOARD, null, null, 0);
        }
        
        String urlString = uri.toString();
        if (urlString.contains("auth/callback") || urlString.contains("code=") || urlString.contains("access_token=")) {
            String code = uri.getQueryParameter("code");
            String accessToken = null;
            String fragment = uri.getFragment();
            if (fragment != null) {
                String[] params = fragment.split("&");
                for (String param : params) {
                    String[] pair = param.split("=");
                    if (pair.length == 2 && pair[0].equals("access_token")) {
                        accessToken = pair[1];
                    }
                }
            }
            return new DeepLinkResult(Route.AUTH_CALLBACK, code, accessToken, 0);
        }
        
        String host = uri.getHost();
        String path = uri.getPath();
        if ("workout".equals(host) || (path != null && path.contains("workout"))) {
            return new DeepLinkResult(Route.WORKOUT, null, null, 0);
        } else if ("nutrition".equals(host) || (path != null && path.contains("nutrition"))) {
            return new DeepLinkResult(Route.NUTRITION, null, null, 0);
        } else if ("health".equals(host) || (path != null && path.contains("health"))) {
            return new DeepLinkResult(Route.HEALTH, null, null, 0);
        }
        
        return new DeepLinkResult(Route.DASHBOARD, null, null, 0);
    }
}
