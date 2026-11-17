const express = require('express');
const router = express.Router();
const {
  getAllBooks,
  getRecommendations,
  getBookById,
  createBook,
  updateBook,
  toggleBookRecommendations,
  deleteBook,
} = require('../controllers/bookController');
const { protectAdmin } = require('../middleware/authMiddleware');
const uploadBookImage = require('../middleware/uploadMiddleware');

// Public routes (Search, filter by category, view weekly/monthly picks)
router.get('/', getAllBooks);
router.get('/recommendations', getRecommendations);
router.get('/:id', getBookById);

// SuperAdmin protected routes (Dashboard book management)
router.post('/', protectAdmin, uploadBookImage.single('image'), createBook);
router.put('/:id', protectAdmin, uploadBookImage.single('image'), updateBook);
router.patch('/:id/recommendations', protectAdmin, toggleBookRecommendations);
router.delete('/:id', protectAdmin, deleteBook);

module.exports = router;
