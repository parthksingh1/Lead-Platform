/**
 * Operational error class.
 * Use for known, expected errors (not found, unauthorized, etc).
 * These propagate to the global error handler with correct status codes.
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
