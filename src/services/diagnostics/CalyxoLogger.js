/**
 * Calyxo Production Observability & Structured Logger
 *
 * Categories:
 * [CALYXO-AI]
 * [CALYXO-HEALTH]
 * [CALYXO-WEARABLE]
 * [CALYXO-WORKOUT]
 * [CALYXO-NOTIFICATION]
 * [CALYXO-PAYMENT]
 * [CALYXO-SYNC]
 * [CALYXO-LIVE]
 * [CALYXO-PERMISSION]
 *
 * Security: Automatically sanitizes passwords, secrets, tokens, and sensitive PII.
 */

const SENSITIVE_KEYS = new Set([
  'password',
  'secret',
  'token',
  'apikey',
  'key_secret',
  'razorpay_signature',
  'auth_token',
  'access_token',
  'refresh_token',
  'credit_card',
  'cvv'
]);

function sanitizeMeta(meta) {
  if (!meta || typeof meta !== 'object') return meta;
  if (Array.isArray(meta)) return meta.map(sanitizeMeta);

  const clean = {};
  for (const [key, val] of Object.entries(meta)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      clean[key] = '***REDACTED***';
    } else if (typeof val === 'object' && val !== null) {
      clean[key] = sanitizeMeta(val);
    } else {
      clean[key] = val;
    }
  }
  return clean;
}

export class CalyxoLogger {
  static logCategory(category, message, meta = null) {
    const tag = `[CALYXO-${category.toUpperCase()}]`;
    const cleanMeta = meta ? sanitizeMeta(meta) : null;
    if (cleanMeta) {
      console.log(`${tag} ${message}`, cleanMeta);
    } else {
      console.log(`${tag} ${message}`);
    }
  }

  static ai(message, meta = null) {
    this.logCategory('AI', message, meta);
  }

  static health(message, meta = null) {
    this.logCategory('HEALTH', message, meta);
  }

  static wearable(message, meta = null) {
    this.logCategory('WEARABLE', message, meta);
  }

  static workout(message, meta = null) {
    this.logCategory('WORKOUT', message, meta);
  }

  static notification(message, meta = null) {
    this.logCategory('NOTIFICATION', message, meta);
  }

  static payment(message, meta = null) {
    this.logCategory('PAYMENT', message, meta);
  }

  static sync(message, meta = null) {
    this.logCategory('SYNC', message, meta);
  }

  static live(message, meta = null) {
    this.logCategory('LIVE', message, meta);
  }

  static permission(message, meta = null) {
    this.logCategory('PERMISSION', message, meta);
  }
}

export const calyxoLogger = CalyxoLogger;
export default CalyxoLogger;
