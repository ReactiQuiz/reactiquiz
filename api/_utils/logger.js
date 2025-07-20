// api/_utils/logger.js
const debug = require('debug');
const chalk = require('chalk');

const C_NAMESPACE = 22;
const C_STATUS = 11;
const C_MESSAGE = 75;

const infoDebugger = debug('reactiquiz:info');
const errorDebugger = debug('reactiquiz:error');
const dbDebugger = debug('reactiquiz:db');
const apiDebugger = debug('reactiquiz:api');

debug.enable('reactiquiz:*');

function log(debuggerInstance, status, message, details = '') {
    if (!debuggerInstance.enabled) return;
    const namespace = `reactiquiz:${debuggerInstance.namespace.split(':').pop()}`;
    let statusColor = chalk.white, messageColor = chalk.white;
    switch (status.toUpperCase()) {
        case 'SUCCESS': statusColor = chalk.greenBright; break;
        case 'ERROR': case 'FAILED': case 'FATAL': statusColor = chalk.redBright; messageColor = chalk.red; break;
        case 'WARN': statusColor = chalk.yellowBright; messageColor = chalk.yellow; break;
        case 'INFO': statusColor = chalk.blueBright; break;
        case 'DB': statusColor = chalk.cyanBright; break;
        case 'GET': case 'POST': case 'PUT': case 'DELETE': statusColor = chalk.magentaBright; messageColor = chalk.whiteBright; break;
    }
    const nsStr = chalk.gray(namespace.padEnd(C_NAMESPACE));
    const statusStr = statusColor(status.padEnd(C_STATUS));
    const msgStr = messageColor(message.padEnd(C_MESSAGE));
    console.log(`${nsStr}${statusStr}${msgStr}${chalk.dim.gray(details)}`);
}

module.exports = {
    logInfo: (status, message, details) => log(infoDebugger, status, message, details),
    logError: (status, message, details) => log(errorDebugger, status, message, details),
    logDb: (status, message, details) => log(dbDebugger, status, message, details),
    logApi: (status, message, details) => log(apiDebugger, status, message, details),
};