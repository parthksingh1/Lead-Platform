const request = require('supertest');
const User = require('../src/models/User');
const { generateTokenPair } = require('../src/utils/tokens');

const createUser = async (overrides = {}) => {
  const defaults = {
    name: 'Test User',
    email: `test-${Date.now()}@example.com`,
    password: 'password123',
    role: 'member',
  };
  const userData = { ...defaults, ...overrides };
  const user = await User.create(userData);
  const tokens = generateTokenPair(user._id);
  return { user, ...tokens };
};

const createAdmin = (overrides = {}) =>
  createUser({ role: 'admin', name: 'Admin User', ...overrides });

const createMember = (overrides = {}) =>
  createUser({ role: 'member', name: 'Member User', ...overrides });

module.exports = { createUser, createAdmin, createMember };
