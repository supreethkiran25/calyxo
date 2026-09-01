package com.calyxo.app.foundation.health;

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCallback;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattDescriptor;
import android.bluetooth.BluetoothGattService;
import android.bluetooth.BluetoothManager;
import android.bluetooth.BluetoothProfile;
import android.content.Context;
import android.os.Handler;
import android.os.Looper;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Native Android BLE Central Manager for Heart Rate Monitors (Service 0x180D).
 * Implements 9-state finite state machine, bounded exponential backoff, and strict zero-fake-data rules.
 */
public final class CalyxoNativeBleManager {
    private static CalyxoNativeBleManager instance;
    
    public enum BLEState {
        IDLE,
        SCANNING,
        CONNECTING,
        CONNECTED,
        STREAMING,
        DISCONNECTING,
        DISCONNECTED,
        RECONNECTING,
        BLUETOOTH_DISABLED,
        PERMISSION_DENIED
    }
    
    public static class HeartRateTelemetry {
        public final int heartRateBpm;
        public final List<Double> rrIntervalsMs;
        public final boolean hasContact;
        public final long timestamp;
        
        public HeartRateTelemetry(int heartRateBpm, List<Double> rrIntervalsMs, boolean hasContact, long timestamp) {
            this.heartRateBpm = heartRateBpm;
            this.rrIntervalsMs = rrIntervalsMs;
            this.hasContact = hasContact;
            this.timestamp = timestamp;
        }
    }
    
    public static final UUID HEART_RATE_SERVICE_UUID = UUID.fromString("0000180d-0000-1000-8000-00805f9b34fb");
    public static final UUID HEART_RATE_MEASUREMENT_UUID = UUID.fromString("00002a37-0000-1000-8000-00805f9b34fb");
    public static final UUID CLIENT_CHARACTERISTIC_CONFIG_UUID = UUID.fromString("00002902-0000-1000-8000-00805f9b34fb");
    
    private final Context context;
    private BluetoothAdapter bluetoothAdapter;
    private BluetoothGatt bluetoothGatt;
    private BluetoothDevice targetDevice;
    
    private BLEState currentState = BLEState.IDLE;
    private HeartRateTelemetry latestTelemetry = null;
    
    private int reconnectAttempts = 0;
    private static final int MAX_RECONNECT_ATTEMPTS = 6;
    private final Handler mainHandler = new Handler(Looper.getMainLooper());
    private boolean isUserInitiatedDisconnect = false;
    
    private CalyxoNativeBleManager(Context context) {
        this.context = context.getApplicationContext();
        BluetoothManager bm = (BluetoothManager) context.getSystemService(Context.BLUETOOTH_SERVICE);
        if (bm != null) {
            this.bluetoothAdapter = bm.getAdapter();
        }
    }
    
    public static synchronized CalyxoNativeBleManager getInstance(Context context) {
        if (instance == null) {
            instance = new CalyxoNativeBleManager(context);
        }
        return instance;
    }
    
    public BLEState getCurrentState() {
        return currentState;
    }
    
    public HeartRateTelemetry getLatestTelemetry() {
        return latestTelemetry;
    }
    
    public void connect(BluetoothDevice device) {
        if (bluetoothAdapter == null || !bluetoothAdapter.isEnabled()) {
            currentState = BLEState.BLUETOOTH_DISABLED;
            return;
        }
        
        this.targetDevice = device;
        this.isUserInitiatedDisconnect = false;
        this.currentState = BLEState.CONNECTING;
        
        try {
            this.bluetoothGatt = device.connectGatt(context, false, gattCallback, BluetoothDevice.TRANSPORT_LE);
        } catch (SecurityException e) {
            currentState = BLEState.PERMISSION_DENIED;
        }
    }
    
    public void disconnect() {
        isUserInitiatedDisconnect = true;
        reconnectAttempts = 0;
        latestTelemetry = null;
        
        if (bluetoothGatt != null) {
            try {
                currentState = BLEState.DISCONNECTING;
                bluetoothGatt.disconnect();
            } catch (SecurityException ignored) {}
        } else {
            currentState = BLEState.IDLE;
        }
    }
    
    private void scheduleReconnect() {
        if (isUserInitiatedDisconnect || targetDevice == null || reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
            currentState = BLEState.DISCONNECTED;
            return;
        }
        
        reconnectAttempts++;
        long delayMs = Math.min(30000L, (long) (Math.pow(2, reconnectAttempts - 1) * 1000L));
        currentState = BLEState.RECONNECTING;
        
        mainHandler.postDelayed(() -> {
            if (!isUserInitiatedDisconnect && targetDevice != null) {
                connect(targetDevice);
            }
        }, delayMs);
    }
    
    public static HeartRateTelemetry parseGattHeartRate(byte[] data) {
        if (data == null || data.length == 0) return null;
        
        int flags = data[0] & 0xFF;
        boolean is16Bit = (flags & 0x01) != 0;
        int offset = 1;
        
        int bpm;
        if (is16Bit) {
            if (data.length < offset + 2) return null;
            bpm = (data[offset] & 0xFF) | ((data[offset + 1] & 0xFF) << 8);
            offset += 2;
        } else {
            if (data.length < offset + 1) return null;
            bpm = data[offset] & 0xFF;
            offset += 1;
        }
        
        boolean hasContact = ((flags & 0x06) >> 1) >= 2;
        boolean rrPresent = (flags & 0x10) != 0;
        List<Double> rrList = new ArrayList<>();
        
        if (rrPresent) {
            while (offset + 1 < data.length) {
                int rawRR = (data[offset] & 0xFF) | ((data[offset + 1] & 0xFF) << 8);
                double rrMs = (rawRR / 1024.0) * 1000.0;
                rrList.add(rrMs);
                offset += 2;
            }
        }
        
        return new HeartRateTelemetry(bpm, rrList, hasContact, System.currentTimeMillis());
    }
    
    private final BluetoothGattCallback gattCallback = new BluetoothGattCallback() {
        @Override
        public void onConnectionStateChange(BluetoothGatt gatt, int status, int newState) {
            if (newState == BluetoothProfile.STATE_CONNECTED) {
                currentState = BLEState.CONNECTED;
                reconnectAttempts = 0;
                try {
                    gatt.discoverServices();
                } catch (SecurityException ignored) {}
            } else if (newState == BluetoothProfile.STATE_DISCONNECTED) {
                latestTelemetry = null; // Zero fake data on disconnect
                if (bluetoothGatt != null) {
                    try {
                        bluetoothGatt.close();
                    } catch (SecurityException ignored) {}
                    bluetoothGatt = null;
                }
                if (isUserInitiatedDisconnect) {
                    currentState = BLEState.DISCONNECTED;
                } else {
                    scheduleReconnect();
                }
            }
        }
        
        @Override
        public void onServicesDiscovered(BluetoothGatt gatt, int status) {
            if (status == BluetoothGatt.GATT_SUCCESS) {
                BluetoothGattService hrService = gatt.getService(HEART_RATE_SERVICE_UUID);
                if (hrService != null) {
                    BluetoothGattCharacteristic hrChar = hrService.getCharacteristic(HEART_RATE_MEASUREMENT_UUID);
                    if (hrChar != null) {
                        try {
                            gatt.setCharacteristicNotification(hrChar, true);
                            BluetoothGattDescriptor desc = hrChar.getDescriptor(CLIENT_CHARACTERISTIC_CONFIG_UUID);
                            if (desc != null) {
                                desc.setValue(BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE);
                                gatt.writeDescriptor(desc);
                            }
                            currentState = BLEState.STREAMING;
                        } catch (SecurityException ignored) {}
                    }
                }
            }
        }
        
        @Override
        public void onCharacteristicChanged(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic) {
            if (HEART_RATE_MEASUREMENT_UUID.equals(characteristic.getUuid())) {
                byte[] data = characteristic.getValue();
                HeartRateTelemetry telemetry = parseGattHeartRate(data);
                if (telemetry != null) {
                    latestTelemetry = telemetry;
                    currentState = BLEState.STREAMING;
                }
            }
        }
    };
}
