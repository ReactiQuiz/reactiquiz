// api/_utils/logger.js
/**
 * Logging Utility
 * 
 * Minimal ESM-safe logger without external dependencies to avoid CJS interop issues on Vercel.
 * Provides structured logging with timestamps, namespaces, and optional details.
 * All logs are formatted consistently for easy parsing and monitoring.
 */

/**
 * Format Log Message
 * 
 * Formats a log message with timestamp, namespace, status, message, and optional details.
 * 
 * @param {string} namespace - Log namespace (e.g., 'reactiquiz:info')
 * @param {string} status - Log status/level
 * @param {string} message - Log message
 * @param {string} [details=''] - Optional additional details
 * @returns {string} Formatted log message
 */
function format(namespace, status, message, details = '') {
    const ts = new Date().toISOString();
    return `[${ts}] ${namespace} ${status}: ${message}${details ? ` | ${details}` : ''}`;
}

/**
 * Log Info Message
 * 
 * Logs an informational message to the console.
 * 
 * @param {string} status - Status/level of the log
 * @param {string} message - Log message
 * @param {string} [details] - Optional additional details
 */
const logInfo = (status, message, details) => {
    console.log(format('reactiquiz:info', status, message, details));
};

/**
 * Log Error Message
 * 
 * Logs an error message to the console error stream.
 * 
 * @param {string} status - Status/level of the log
 * @param {string} message - Log message
 * @param {string} [details] - Optional additional details
 */
const logError = (status, message, details) => {
    console.error(format('reactiquiz:error', status, message, details));
};

/**
 * Log Database Message
 * 
 * Logs a database-related message to the console.
 * 
 * @param {string} status - Status/level of the log
 * @param {string} message - Log message
 * @param {string} [details] - Optional additional details
 */
const logDb = (status, message, details) => {
    console.log(format('reactiquiz:db', status, message, details));
};

/**
 * Log API Message
 * 
 * Logs an API-related message to the console.
 * 
 * @param {string} status - Status/level of the log
 * @param {string} message - Log message
 * @param {string} [details] - Optional additional details
 */
const logApi = (status, message, details) => {
    console.log(format('reactiquiz:api', status, message, details));
};

module.exports = {
    logInfo,
    logError,
    logDb,
    logApi,
};