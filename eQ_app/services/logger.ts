/* eslint-disable no-console */

/**
 * Production-safe logger.
 * In development (__DEV__) all calls pass through to console.
 * In production builds all calls are no-ops so no sensitive data
 * leaks into device logs or crash-reporting tools.
 */
const logger = {
  log: (...args: unknown[]) => {
    if (__DEV__) console.log(...args);
  },
  info: (...args: unknown[]) => {
    if (__DEV__) console.info(...args);
  },
  warn: (...args: unknown[]) => {
    if (__DEV__) console.warn(...args);
  },
  error: (...args: unknown[]) => {
    if (__DEV__) console.error(...args);
  },
};

export default logger;
