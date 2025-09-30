import debug from 'debug';
import chalk from 'chalk';

const C_NAMESPACE = 22;
const C_STATUS = 11;
const C_MESSAGE = 75;

const infoDebugger = debug('reactiquiz:info');
const errorDebugger = debug('reactiquiz:error');
const dbDebugger = debug('reactiquiz:db');
const apiDebugger = debug('reactiquiz:api');

if (process.env.DEBUG) {
    debug.enable(process.env.DEBUG);
} else if (process.env.NODE_ENV !== 'production') {
    debug.enable('reactiquiz:*');
}

function log(debuggerInstance: debug.Debugger, status: string, message: string, details: string = ''): void {
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

export const logInfo = (status: string, message: string, details?: string): void => log(infoDebugger, status, message, details);
export const logError = (status: string, message: string, details?: string): void => log(errorDebugger, status, message, details);
export const logDb = (status: string, message: string, details?: string): void => log(dbDebugger, status, message, details);
export const logApi = (status: string, message: string, details?: string): void => log(apiDebugger, status, message, details);
