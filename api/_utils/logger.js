// Minimal ESM-safe logger without external deps to avoid CJS interop issues on Vercel

function format(namespace, status, message, details = '') {
    const ts = new Date().toISOString();
    return `[${ts}] ${namespace} ${status}: ${message}${details ? ` | ${details}` : ''}`;
}

const logInfo = (status, message, details) => {
    console.log(format('reactiquiz:info', status, message, details));
};

const logError = (status, message, details) => {
    console.error(format('reactiquiz:error', status, message, details));
};

const logDb = (status, message, details) => {
    console.log(format('reactiquiz:db', status, message, details));
};

const logApi = (status, message, details) => {
    console.log(format('reactiquiz:api', status, message, details));
};

module.exports = {
    logInfo,
    logError,
    logDb,
    logApi,
};