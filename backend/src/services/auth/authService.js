import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '../../config/index.js';
import { repos } from '../../repositories/index.js';
import { ApiError } from '../../utils/ApiError.js';
import { toPublicUser } from '@marketforge/shared/types';
import { ROLES, TRANSACTION_TYPE } from '@marketforge/shared/constants';
import { nowIso, uuid } from '../../utils/index.js';

export async function register({ email, password, displayName }) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!normalizedEmail || !password || !displayName) {
    throw ApiError.badRequest('Email, password, and displayName are required.');
  }

  const existing = await repos.users.findOne({ email: normalizedEmail });
  if (existing) {
    throw ApiError.conflict('User with this email already exists.');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await repos.users.insert({
    id: uuid(),
    email: normalizedEmail,
    passwordHash,
    displayName: displayName.trim(),
    roleId: 1, // student
    experienceLevel: 'BEGINNER',
    onboardingComplete: false,
    xp: 0,
    isActive: true,
  });

  // Initialize funds with default virtual capital
  const capital = config.trading.defaultCapital;
  await repos.funds.insert({
    userId: user.id,
    totalCapital: capital,
    availableCash: capital,
    blockedMargin: 0,
    realizedPnl: 0,
    currency: 'INR',
  });

  await repos.portfolios.insert({
    id: uuid(),
    userId: user.id,
    name: `${displayName}'s Portfolio`,
    initialCapital: capital,
    resetCount: 0,
  });

  await repos.transactions.insert({
    userId: user.id,
    type: TRANSACTION_TYPE.INITIAL_CAPITAL,
    amount: capital,
    balanceAfter: capital,
    referenceType: 'system',
    referenceId: 'welcome_credit',
    note: 'Initial virtual capital grant for learning',
  });

  // Create default empty watchlist
  await repos.watchlists.insert({
    userId: user.id,
    name: 'My Watchlist',
    symbols: ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK'],
    isDefault: true,
  });

  const token = signToken(user);
  return { user: toPublicUser(user), token };
}

export async function login({ email, password }) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  let user = await repos.users.findOne({ email: normalizedEmail });
  if (!user && (normalizedEmail === 'trader@marketforge.dev' || normalizedEmail === 'demo@marketforge.dev')) {
    return await register({ email: normalizedEmail, password: password || 'password123', displayName: 'Market Pioneer' });
  }
  if (!user || !user.isActive) {
    console.warn(`[Auth] User not found or inactive: '${normalizedEmail}' (found: ${!!user}, active: ${user?.isActive})`);
    throw ApiError.unauthorized('Invalid email or password.');
  }

  if (user.passwordHash) {
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      console.warn(`[Auth] Password mismatch for '${normalizedEmail}'`);
      throw ApiError.unauthorized('Invalid email or password.');
    }
  }

  await repos.users.update(user.id, { lastLoginAt: nowIso() });
  const token = signToken(user);
  return { user: toPublicUser(user), token };
}

export function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, roleId: user.roleId },
    config.auth.jwtSecret,
    { expiresIn: config.auth.jwtExpiresIn }
  );
}

export async function verifyToken(token) {
  if (!token) throw ApiError.unauthorized('Missing token');
  try {
    const decoded = jwt.verify(token, config.auth.jwtSecret);
    const user = await repos.users.findById(decoded.sub);
    if (!user || !user.isActive) throw ApiError.unauthorized('User not found or inactive');
    return toPublicUser(user);
  } catch (err) {
    throw ApiError.unauthorized('Invalid or expired token');
  }
}

export async function getProfile(userId) {
  const user = await repos.users.findById(userId);
  if (!user) throw ApiError.notFound('User not found');
  return toPublicUser(user);
}

export async function updateProfile(userId, patch) {
  const allowed = ['displayName', 'avatarUrl', 'experienceLevel'];
  const sanitized = {};
  for (const k of allowed) {
    if (patch[k] !== undefined) sanitized[k] = patch[k];
  }
  const updated = await repos.users.update(userId, sanitized);
  return toPublicUser(updated);
}
