import { verifyToken } from '../services/auth/authService.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/index.js';

export const requireAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Missing or malformed Authorization header');
  }
  const token = header.slice(7);
  req.user = await verifyToken(token);
  next();
});

export const optionalAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    try {
      req.user = await verifyToken(header.slice(7));
    } catch {
      req.user = null;
    }
  } else {
    req.user = null;
  }
  next();
});

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) throw ApiError.unauthorized();
  // Role 3 = admin, 4 = super_admin in default seeds
  if (roles.includes('admin') && (req.user.roleId === 3 || req.user.roleId === 4 || req.user.role === 'admin' || req.user.role === 'super_admin')) {
    return next();
  }
  if (req.user.role && roles.includes(req.user.role)) {
    return next();
  }
  throw ApiError.forbidden('You do not have permission to access this resource');
};
