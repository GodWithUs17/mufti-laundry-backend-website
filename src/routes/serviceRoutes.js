const express = require('express');
const {
  getServices,
  createService,
  updateService,
  deleteService
} = require('../controllers/serviceController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// PUBLIC ROUTE: Get all services (no auth required) - MUST come before protect middleware
router.get('/public', getServices);

// PROTECTED ROUTES
router.get('/', protect, getServices);
router.post('/', protect, createService);
router.put('/:id', protect, updateService);
router.delete('/:id', protect, deleteService);

module.exports = router;