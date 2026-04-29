const express = require('express');
const router = express.Router();
const { 
  createOrder, 
  updateOrderStatus, 
  trackOrder,
  generateBill,
  getAllOrders,
  getPublicInvoice,
  assignOrder 
} = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// PUBLIC ROUTES
router.post('/book', createOrder);
router.get('/track/:code', trackOrder);
router.get('/invoice/:orderId', getPublicInvoice);

// PROTECTED ROUTES (Logged in staff/admin only)
router.put('/:id/bill', protect, adminOnly, generateBill); // Commented out until generateBill is implemented
router.put('/status/:id', protect, updateOrderStatus);
router.get('/all', protect, getAllOrders);
// Link an order to a staff member
router.patch('/:orderId/assign', protect, adminOnly, assignOrder);

module.exports = router;