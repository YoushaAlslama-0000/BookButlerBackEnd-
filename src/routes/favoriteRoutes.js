const express = require('express');
const router = express.Router();
const { getMyFavorites, toggleFavorite } = require('../controllers/favoriteController');
const { protectUser } = require('../middleware/authMiddleware');

router.get('/', protectUser, getMyFavorites);
router.post('/:bookId', protectUser, toggleFavorite);

module.exports = router;
