const express = require('express');
const { body } = require('express-validator');
const { signup, login, me } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.post(
  '/signup',
  [
    body('name').isString().isLength({ min: 2 }),
    body('email').isEmail(),
    body('password').isString().isLength({ min: 6 }),
  ],
  signup
);

router.post(
  '/login',
  [
    body('email').isEmail(),
    body('password').isString().notEmpty(),
  ],
  login
);

router.get('/me', authMiddleware, me);

module.exports = router;
