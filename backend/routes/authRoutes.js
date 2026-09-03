const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, updateProfile, generateTelegramToken, unlinkTelegram, getAllUsers } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.get('/users', protect, getAllUsers);
router.put('/profile', protect, updateProfile);
router.post('/telegram-token', protect, generateTelegramToken);
router.post('/telegram-unlink', protect, unlinkTelegram);

module.exports = router;
