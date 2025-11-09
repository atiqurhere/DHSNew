const express = require('express');
const router = express.Router();
const {
  getPageContent,
  getAllPageContent,
  updatePageContent,
  addSection,
  updateSection,
  deleteSection
} = require('../controllers/pageController');
const { protect, admin } = require('../middleware/auth');

// Public routes
router.get('/:pageType', getPageContent);

// Admin routes
router.get('/admin/all', protect, admin, getAllPageContent);
router.put('/:pageType', protect, admin, updatePageContent);
router.post('/:pageType/sections', protect, admin, addSection);
router.put('/:pageType/sections/:sectionId', protect, admin, updateSection);
router.delete('/:pageType/sections/:sectionId', protect, admin, deleteSection);

module.exports = router;
