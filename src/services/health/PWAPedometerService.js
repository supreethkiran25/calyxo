/**
 * Calyxo PWA Real-Time Device Motion Pedometer & Health Bridge
 * Tracks real-time physical steps via phone accelerometer & device motion sensors
 */

const STORAGE_KEY_PREFIX = 'calyxo_pedometer_steps_';
const HISTORY_LEDGER_KEY = 'calyxo_daily_step_history';

export class PWAPedometerService {
  static isTracking = false;
  static lastStepTime = 0;
  static threshold = 11.8; // Acceleration threshold (m/s^2) for human step detection
  static minStepInterval = 320; // Min ms between valid walking steps (max ~3 steps/sec)
  static listeners = new Set();

  static getTodayKey() {
    const today = new Date().toISOString().split('T')[0];
    return `${STORAGE_KEY_PREFIX}${today}`;
  }

  static getDateKey(dateStr) {
    if (!dateStr) return this.getTodayKey();
    return `${STORAGE_KEY_PREFIX}${dateStr}`;
  }

  /**
   * Get historical step records across all recorded dates (persistent background ledger)
   */
  static getDailyStepHistory() {
    if (typeof localStorage === 'undefined') return {};
    try {
      const raw = localStorage.getItem(HISTORY_LEDGER_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  /**
   * Save step count for a specific date into daily key and background history ledger
   */
  static setStepsForDate(dateStr, steps) {
    if (typeof localStorage === 'undefined') return;
    try {
      const cleanSteps = Math.max(0, parseInt(steps, 10) || 0);
      const key = this.getDateKey(dateStr);
      localStorage.setItem(key, String(cleanSteps));

      // Persist to historical ledger
      const history = this.getDailyStepHistory();
      history[dateStr] = cleanSteps;
      localStorage.setItem(HISTORY_LEDGER_KEY, JSON.stringify(history));

      const todayStr = new Date().toISOString().split('T')[0];
      if (dateStr === todayStr) {
        this.notify(cleanSteps);
      }
    } catch (e) {}
  }

  /**
   * Get stored step count for a specific calendar date (e.g. YYYY-MM-DD)
   */
  static getStepsForDate(dateStr) {
    if (typeof localStorage === 'undefined') return 0;
    try {
      const key = this.getDateKey(dateStr);
      const val = localStorage.getItem(key);
      if (val !== null) return parseInt(val, 10) || 0;
      const history = this.getDailyStepHistory();
      return history[dateStr] || 0;
    } catch (e) {
      return 0;
    }
  }


  /**
   * Get current stored step count for today
   */
  static getTodaySteps() {
    const today = new Date().toISOString().split('T')[0];
    return this.getStepsForDate(today);
  }

  /**
   * Save today's updated step count
   */
  static setTodaySteps(steps) {
    const today = new Date().toISOString().split('T')[0];
    this.setStepsForDate(today, steps);
  }

  /**
   * Increment today's steps count
   */
  static addSteps(count = 1) {
    const current = this.getTodaySteps();
    const next = current + count;
    this.setTodaySteps(next);
    return next;
  }


  static subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  static notify(steps) {
    this.listeners.forEach(cb => {
      try { cb(steps); } catch (e) {}
    });
  }

  /**
   * Synchronize authoritative steps from native health sources (HealthKit / Health Connect)
   */
  static syncFromNativeSource(nativeSteps) {
    const clean = Math.max(0, parseInt(nativeSteps, 10) || 0);
    const today = new Date().toISOString().split('T')[0];
    const current = this.getStepsForDate(today);
    if (clean > current) {
      this.setStepsForDate(today, clean);
    }
  }

  /**
   * Request device motion permission & start real-time accelerometer step tracking
   */
  static async requestAndStartTracking() {
    if (typeof window === 'undefined') return false;

    // Do NOT run web motion accelerometer on native iOS/Android where HealthKit/HealthConnect is authoritative
    try {
      const { Capacitor } = await import('@capacitor/core');
      if (Capacitor && Capacitor.isNativePlatform()) {
        return false;
      }
    } catch (e) {}

    // iOS Safari permission check
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      try {
        const response = await DeviceMotionEvent.requestPermission();
        if (response === 'granted') {
          this.startMotionListener();
          return true;
        }
      } catch (err) {
        console.warn("DeviceMotionEvent permission request error:", err);
      }
    }

    // Standard Android / Web PWA Sensor API
    if (window.DeviceMotionEvent) {
      this.startMotionListener();
      return true;
    }

    return false;
  }

  /**
   * Attach high-precision accelerometer peak detection for walking steps
   */
  static startMotionListener() {
    if (this.isTracking || typeof window === 'undefined') return;
    this.isTracking = true;

    window.addEventListener('devicemotion', this.handleDeviceMotion, true);
  }

  /**
   * Accelerometer step detection handler
   */
  static handleDeviceMotion = (event) => {
    const acc = event.accelerationIncludingGravity || event.acceleration;
    if (!acc) return;

    const x = acc.x || 0;
    const y = acc.y || 0;
    const z = acc.z || 0;

    // Magnitude vector sqrt(x^2 + y^2 + z^2)
    const magnitude = Math.sqrt(x * x + y * y + z * z);
    const now = Date.now();

    if (magnitude > PWAPedometerService.threshold && (now - PWAPedometerService.lastStepTime) > PWAPedometerService.minStepInterval) {
      PWAPedometerService.lastStepTime = now;
      PWAPedometerService.addSteps(1);
    }
  };
}
