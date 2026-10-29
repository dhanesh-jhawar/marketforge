import { ApiError } from '../utils/ApiError.js';
import { createLogger } from '../utils/logger.js';
import { config } from '../config/index.js';

const log = createLogger('error');

export function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({
      ok: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
  }

  log.error('Unhandled server error', { error: err.message, stack: err.stack, path: req.path });

  res.status(500).json({
    ok: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: config.isProd ? 'An unexpected internal error occurred' : err.message,
    },
  });
}
