const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getPendingMentors,
  verifyMentor,
  createCategory,
  getCategories,
  deleteCategory,
  getRecords
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// Public categories fetch
router.get('/categories', getCategories);

// Admin-only routes
router.use(protect, authorize('admin'));

router.get('/stats', getDashboardStats);
router.get('/records', getRecords);

router.route('/users')
  .get(getAllUsers);

router.route('/users/:id')
  .put(updateUserRole)
  .delete(deleteUser);

router.get('/mentors/pending', getPendingMentors);
router.post('/mentors/:id/verify', verifyMentor);

router.post('/categories', createCategory);
router.delete('/categories/:id', deleteCategory);

module.exports = router;
