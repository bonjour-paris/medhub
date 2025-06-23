const express = require('express');
const router = express.Router();
const authController = require('../controller/authcontroller');
const authMiddleware = require('../middleware/authmiddleware');
const isAdmin = require('../middleware/isAdmin');
const User = require('../models/user');

router.post('/register', authController.register);
router.post('/login', authController.login);

// Admin only route
router.get('/users', authMiddleware, isAdmin, async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
