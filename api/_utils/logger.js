function fmt(ns, status, message, details) {
  const ts = new Date().toISOString();
  return `[${ts}] ${ns} ${status}: ${message}${details ? ` | ${details}` : ''}`;
}

exports.logInfo = (status, message, details) => {
  console.log(fmt('reactiquiz:info', status, message, details));
};

exports.logError = (status, message, details) => {
  console.error(fmt('reactiquiz:error', status, message, details));
};

exports.logDb = (status, message, details) => {
  console.log(fmt('reactiquiz:db', status, message, details));
};

exports.logApi = (status, message, details) => {
  console.log(fmt('reactiquiz:api', status, message, details));
};


