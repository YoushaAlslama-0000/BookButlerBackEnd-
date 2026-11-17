const express = require('express');
const router = express.Router();
const {
  getMyCart,
  addToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
  checkoutViaWhatsApp,
} = require('../controllers/cartController');
const { protectUser } = require('../middleware/authMiddleware');

router.get('/', protectUser, getMyCart);
router.post('/', protectUser, addToCart);
router.post('/checkout-whatsapp', protectUser, checkoutViaWhatsApp);
router.put('/:itemId', protectUser, updateCartItemQuantity);
router.delete('/:itemId', protectUser, removeCartItem);
router.delete('/', protectUser, clearCart);

module.exports = router;
