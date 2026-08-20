package com.calyxo.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(CalyxoNotificationPlugin.class);
        registerPlugin(CalyxoWidgetPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
