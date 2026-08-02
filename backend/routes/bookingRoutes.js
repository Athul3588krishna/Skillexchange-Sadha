const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getMyReviews,
  getMentorReviews,
  processSimulatedPayment,
  updateBookingStatus,
  createReview
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

router.route('/')
  .post(protect, createBooking)
  .get(protect, getMyBookings);

// Must come before /:id routes to avoid params treating these as IDs
router.get('/my-reviews', protect, getMyReviews);
router.get('/mentor-reviews', protect, getMentorReviews);

router.post('/:id/pay', protect, processSimulatedPayment);
router.put('/:id/status', protect, updateBookingStatus);
router.post('/:id/review', protect, createReview);

module.exports = router;
