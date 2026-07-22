const express = require('express');
const router = express.Router();
const {
  createSession,
  getSessions,
  getSessionById,
  updateSession,
  deleteSession
} = require('../controllers/sessionController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(getSessions)
  .post(protect, createSession);

router.route('/:id')
  .get(getSessionById)
  .put(protect, updateSession)
  .delete(protect, deleteSession);

module.exports = router;
