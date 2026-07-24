const express = require('express');
const router = express.Router();
const { getUsers } = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, authorize('admin'), getUsers);

module.exports = router;
