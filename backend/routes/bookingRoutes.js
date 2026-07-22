const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  processSimulatedPayment,
  updateBookingStatus,
  createReview
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

router.route('/')
  .post(protect, createBooking)
  .get(protect, getMyBookings);

router.post('/:id/pay', protect, processSimulatedPayment);
router.put('/:id/status', protect, updateBookingStatus);
router.post('/:id/review', protect, createReview);

module.exports = router;
