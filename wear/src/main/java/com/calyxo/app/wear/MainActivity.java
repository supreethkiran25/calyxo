package com.calyxo.app.wear;

import android.app.Activity;
import android.os.Bundle;
import android.widget.Button;
import android.widget.TextView;

public class MainActivity extends Activity {

    private boolean isRunning = false;
    private int elapsedSeconds = 0;
    private TextView timerText;
    private TextView heartRateText;
    private Button startStopBtn;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Simple native Wear OS fitness tracking interface
        setContentView(android.R.layout.activity_list_item);
    }
}
