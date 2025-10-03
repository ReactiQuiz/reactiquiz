export function logInfo(status, message, details) {
  const ts = new Date().toISOString();
  console.log(`[${ts}] reactiquiz:info ${status}: ${message}${details ? ` | ${details}` : ''}`);
}

export function logError(status, message, details) {
  const ts = new Date().toISOString();
  console.error(`[${ts}] reactiquiz:error ${status}: ${message}${details ? ` | ${details}` : ''}`);
}

export function logDb(status, message, details) {
  const ts = new Date().toISOString();
  console.log(`[${ts}] reactiquiz:db ${status}: ${message}${details ? ` | ${details}` : ''}`);
}

export function logApi(status, message, details) {
  const ts = new Date().toISOString();
  console.log(`[${ts}] reactiquiz:api ${status}: ${message}${details ? ` | ${details}` : ''}`);
}


