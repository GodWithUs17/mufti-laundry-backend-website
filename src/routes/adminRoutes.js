const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/adminController');
const { getAllStaff, addStaff, toggleStaffStatus, deleteStaff } = require('../controllers/StaffController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/admin/stats
 * @desc    Get business overview stats
 * @access  Private (Admin Only)
 */
router.get('/stats', protect, adminOnly, getDashboardStats);
router.get('/staff', protect, adminOnly, getAllStaff);
router.post('/staff', protect, adminOnly, addStaff);
router.patch('/staff/:id/toggle', protect, adminOnly, toggleStaffStatus);
router.delete('/staff/:id', protect, adminOnly, deleteStaff);

module.exports = router;