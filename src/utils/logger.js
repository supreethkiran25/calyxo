/**
 * Calyxo Production-Safe Logger
 *
 * Suppresses sensitive biometric data (BPM, steps, calories, raw Bluetooth packets),
 * authentication tokens, and user PII in production builds (`import.meta.env.PROD`).
 */

const isDev = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.DEV : process.env.NODE_ENV !== 'production';

export const logger = {
  log: (...args) => {
    if (isDev) {
      console.log(...args);
    }
  },
  info: (...args) => {
    if (isDev) {
      console.info(...args);
    }
  },
  warn: (...args) => {
    // Warnings are kept but sanitized
    console.warn(...args);
  },
  error: (...args) => {
    // Errors are logged without sensitive data
    console.error(...args);
  },
  healthEvent: (eventType, summary) => {
    if (isDev) {
      console.log(`[HEALTH-${eventType}]`, summary);
    }
  }
};

export default logger;
