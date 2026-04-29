const express = require('express');
const router = express.Router();
const { getCategories, createCategory,updateCategory, deleteCategory } = require('../controllers/categoryController');
const { protect } = require('../middleware/authMiddleware');

// PUBLIC ROUTE: Get all categories (no auth required) - MUST come first
router.get('/public', getCategories);

// PROTECTED ROUTES
router.get('/', protect, getCategories);
router.post('/', protect, createCategory);
router.put('/:id', protect, updateCategory);
router.delete('/:id', protect, deleteCategory);

module.exports = router;