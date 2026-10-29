import { API_ERROR_CODES } from '@marketforge/shared/constants';

export class ApiError extends Error {
  /**
   * @param {number} status HTTP status
   * @param {string} code   one of API_ERROR_CODES
   * @param {string} message
   * @param {any} [details]
   */
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }

  static badRequest(msg, details) { return new ApiError(400, API_ERROR_CODES.VALIDATION_ERROR, msg, details); }
  static unauthorized(msg = 'Authentication required') { return new ApiError(401, API_ERROR_CODES.UNAUTHORIZED, msg); }
  static forbidden(msg = 'Forbidden') { return new ApiError(403, API_ERROR_CODES.FORBIDDEN, msg); }
  static notFound(msg = 'Not found') { return new ApiError(404, API_ERROR_CODES.NOT_FOUND, msg); }
  static conflict(msg) { return new ApiError(409, API_ERROR_CODES.CONFLICT, msg); }
  static unprocessable(code, msg, details) { return new ApiError(422, code, msg, details); }
  static providerUnavailable(msg, details) { return new ApiError(503, API_ERROR_CODES.PROVIDER_UNAVAILABLE, msg, details); }
  static notImplemented(what) { return new ApiError(501, API_ERROR_CODES.NOT_IMPLEMENTED, `${what} is not implemented yet`); }
}
