// api/_utils/asyncHandler.js
/**
 * Async Route Handler Wrapper
 *
 * Express 4 does not route a rejected promise from an async handler to the
 * error middleware — it becomes an unhandled rejection and the request hangs
 * until the client times out. This wraps a handler so any throw or rejection
 * (including one from inside a route's own catch block) reaches next(err),
 * which api/index.js's global error handler turns into a 500 response.
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve()
        .then(() => fn(req, res, next))
        .catch(next);
};

module.exports = { asyncHandler };
