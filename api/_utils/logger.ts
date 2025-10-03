// Minimal ESM-safe logger without external deps to avoid CJS interop issues on Vercel

type LogLevel = 'INFO' | 'ERROR' | 'DB' | 'API' | 'GET' | 'POST' | 'PUT' | 'DELETE' | 'WARN' | 'SUCCESS' | 'FATAL';

function format(namespace: string, status: LogLevel, message: string, details: string = ''): string {
    const ts = new Date().toISOString();
    return `[${ts}] ${namespace} ${status}: ${message}${details ? ` | ${details}` : ''}`;
}

export const logInfo = (status: string, message: string, details?: string): void => {
    console.log(format('reactiquiz:info', status as LogLevel, message, details));
};

export const logError = (status: string, message: string, details?: string): void => {
    console.error(format('reactiquiz:error', status as LogLevel, message, details));
};

export const logDb = (status: string, message: string, details?: string): void => {
    console.log(format('reactiquiz:db', status as LogLevel, message, details));
};

export const logApi = (status: string, message: string, details?: string): void => {
    console.log(format('reactiquiz:api', status as LogLevel, message, details));
};
