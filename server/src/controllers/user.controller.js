const User = require('../models/User');

/**
 * GET /api/users
 * Admin only. Returns all team members for lead assignment dropdown.
 */
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('name email role').sort({ name: 1 });

    res.json({
      success: true,
      data: { users },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers };
