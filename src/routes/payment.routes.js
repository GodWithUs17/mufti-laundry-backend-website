const express = require('express');
const router = express.Router();
const { recordPayment } = require('../controllers/payment.controller');
const { getDailyFinanceReport } = require('../controllers/report.controller');
const { protect } = require('../middleware/authMiddleware');

// Path: /api/payments/...
router.post('/record/:orderId', recordPayment);
router.get('/report/daily', protect, getDailyFinanceReport);

module.exports = router;