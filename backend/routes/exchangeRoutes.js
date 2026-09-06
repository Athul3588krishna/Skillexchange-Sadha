const express = require('express');
const router = express.Router();
const {
  sendExchangeRequest,
  getMyExchangeRequests,
  updateExchangeRequestStatus,
  createExchangeReview
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

router.route('/')
  .post(protect, sendExchangeRequest)
  .get(protect, getMyExchangeRequests);

router.route('/:id')
  .put(protect, updateExchangeRequestStatus);

router.post('/:id/review', protect, createExchangeReview);

module.exports = router;
