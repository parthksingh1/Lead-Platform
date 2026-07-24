const User = require('../models/User');
const AppError = require('../utils/AppError');
const { generateTokenPair } = require('../utils/tokens');
const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * POST /api/auth/register
 * Admin-only in production; open during seeding.
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('A user with this email already exists.', 409);
    }

    // Only admins can create other admins
    const assignedRole =
      req.user?.role === 'admin' && role ? role : 'member';

    const user = await User.create({
      name,
      email,
      password,
      role: assignedRole,
    });

    const tokens = generateTokenPair(user._id);

    res.status(201).json({
      success: true,
      data: { user, ...tokens },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Explicitly select password since it's excluded by default
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      throw new AppError('Invalid email or password.', 401);
    }

    const tokens = generateTokenPair(user._id);

    res.json({
      success: true,
      data: { user, ...tokens },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/refresh
 * Exchanges a valid refresh token for a new token pair.
 */
const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw new AppError('Refresh token is required.', 400);
    }

    const decoded = jwt.verify(refreshToken, config.jwt.secret);
    if (decoded.type !== 'refresh') {
      throw new AppError('Invalid token type.', 401);
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      throw new AppError('User no longer exists.', 401);
    }

    const tokens = generateTokenPair(user._id);

    res.json({
      success: true,
      data: { user, ...tokens },
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(new AppError('Invalid or expired refresh token.', 401));
    }
    next(error);
  }
};

/**
 * GET /api/auth/me
 * Returns the authenticated user's profile.
 */
const getMe = async (req, res) => {
  res.json({
    success: true,
    data: { user: req.user },
  });
};

module.exports = { register, login, refresh, getMe };
