// backend/utils/logger.js
const debug = require('debug');
const chalk = require('chalk'); // Now this works perfectly with v4.1.2

// Adjust column widths for better fit
const C_NAMESPACE = 22;
const C_STATUS = 11;
const C_MESSAGE = 75;

// Create debug instances. The namespace is just for filtering.
const infoDebugger = debug('reactiquiz:info');
const errorDebugger = debug('reactiquiz:error');
const dbDebugger = debug('reactiquiz:db');
const apiDebugger = debug('reactiquiz:api');

// Enable all our custom debuggers by default
debug.enable('reactiquiz:*');

function log(debuggerInstance, status, message, details = '') {
    // Only log if this specific debugger is enabled (e.g., via DEBUG env var)
    if (!debuggerInstance.enabled) {
        return;
    }

    const namespace = `reactiquiz:${debuggerInstance.namespace.split(':').pop()}`;
    let statusColor = chalk.white;
    let messageColor = chalk.white; // Default color for message

    // Assign colors based on status
    switch (status.toUpperCase()) {
        case 'SUCCESS':
            statusColor = chalk.greenBright;
            break;
        case 'ERROR':
        case 'FAILED':
        case 'FATAL':
            statusColor = chalk.redBright;
            messageColor = chalk.red;
            break;
        case 'WARN':
            statusColor = chalk.yellowBright;
            messageColor = chalk.yellow;
            break;
        case 'INFO':
            statusColor = chalk.blueBright;
            break;
        case 'CONNECT':
        case 'DB':
        case 'ATTACHED':
            statusColor = chalk.cyanBright;
            break;
        case 'GET':
        case 'POST':
        case 'PUT':
        case 'DELETE':
            statusColor = chalk.magentaBright;
            messageColor = chalk.whiteBright;
            break;
    }

    // Pad each part to fit its column width
    const nsStr = chalk.green(namespace.padEnd(C_NAMESPACE));
    const statusStr = statusColor(status.padEnd(C_STATUS));
    const msgStr = messageColor(message.padEnd(C_MESSAGE));
    
    console.log(`${nsStr}${statusStr}${msgStr}${chalk.blueBright(details)}`);
}

// Export pre-configured logger functions for different modules
module.exports = {
    logInfo: (status, message, details) => log(infoDebugger, status, message, details),
    logError: (status, message, details) => log(errorDebugger, status, message, details),
    logDb: (status, message, details) => log(dbDebugger, status, message, details),
    logApi: (status, message, details) => log(apiDebugger, status, message, details),
};