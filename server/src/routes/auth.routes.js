const express = require('express');
const router = express.Router();
const { register, login, refresh, getMe } = require('../controllers/auth.controller');
const { registerRules, loginRules } = require('../validators/auth.validators');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');

router.post('/register', registerRules, validate, register);
router.post('/login', loginRules, validate, login);
router.post('/refresh', refresh);
router.get('/me', authenticate, getMe);

module.exports = router;
