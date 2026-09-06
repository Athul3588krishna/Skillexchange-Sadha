const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, updateProfile, getAllUsers } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.get('/users', protect, getAllUsers);
router.put('/profile', protect, updateProfile);

module.exports = router;
