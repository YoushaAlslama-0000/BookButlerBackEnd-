const { CartItem, Book, Category } = require('../models');
const { generateOrderWhatsAppLink } = require('../utils/whatsappHelper');

// GET /api/cart
const getMyCart = async (req, res) => {
  try {
    const items = await CartItem.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Book,
          as: 'book',
          include: [{ model: Category, as: 'categories', through: { attributes: [] } }],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    let totalOriginalPrice = 0;
    let totalFinalPrice = 0;

    const formattedItems = items.map((item) => {
      const unitOriginal = item.book.price;
      const unitFinal = item.book.finalPrice;
      const subtotalOriginal = Number((unitOriginal * item.quantity).toFixed(2));
      const subtotalFinal = Number((unitFinal * item.quantity).toFixed(2));

      totalOriginalPrice += subtotalOriginal;
      totalFinalPrice += subtotalFinal;

      return {
        id: item.id,
        quantity: item.quantity,
        subtotalOriginal,
        subtotalFinal,
        book: item.book,
      };
    });

    return res.status(200).json({
      success: true,
      totalItems: formattedItems.reduce((sum, i) => sum + i.quantity, 0),
      totalOriginalPrice: Number(totalOriginalPrice.toFixed(2)),
      totalFinalPrice: Number(totalFinalPrice.toFixed(2)),
      totalSavings: Number((totalOriginalPrice - totalFinalPrice).toFixed(2)),
      items: formattedItems,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'خطأ في جلب السلة', error: error.message });
  }
};

// POST /api/cart
const addToCart = async (req, res) => {
  try {
    const { bookId, quantity = 1 } = req.body;
    if (!bookId) {
      return res.status(400).json({ success: false, message: 'يرجى تحديد معرف الكتاب (bookId)' });
    }

    const book = await Book.findByPk(bookId);
    if (!book) {
      return res.status(404).json({ success: false, message: 'الكتاب غير موجود' });
    }

    const qty = Math.max(1, parseInt(quantity, 10) || 1);

    let cartItem = await CartItem.findOne({
      where: { userId: req.user.id, bookId: book.id },
    });

    if (cartItem) {
      cartItem.quantity += qty;
      await cartItem.save();
    } else {
      cartItem = await CartItem.create({
        userId: req.user.id,
        bookId: book.id,
        quantity: qty,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'تمت إضافة الكتاب إلى السلة بنجاح',
      cartItem,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'خطأ في إضافة الكتاب للسلة', error: error.message });
  }
};

// PUT /api/cart/:itemId
const updateCartItemQuantity = async (req, res) => {
  try {
    const { quantity } = req.body;
    const cartItem = await CartItem.findOne({
      where: { id: req.params.itemId, userId: req.user.id },
    });

    if (!cartItem) {
      return res.status(404).json({ success: false, message: 'العنصر غير موجود في السلة' });
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      await cartItem.destroy();
      return res.status(200).json({ success: true, message: 'تم حذف الكتاب من السلة' });
    }

    cartItem.quantity = qty;
    await cartItem.save();

    return res.status(200).json({ success: true, message: 'تم تحديث الكمية بنجاح', cartItem });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'خطأ في تحديث السلة', error: error.message });
  }
};

// DELETE /api/cart/:itemId
const removeCartItem = async (req, res) => {
  try {
    const cartItem = await CartItem.findOne({
      where: { id: req.params.itemId, userId: req.user.id },
    });

    if (!cartItem) {
      return res.status(404).json({ success: false, message: 'العنصر غير موجود في السلة' });
    }

    await cartItem.destroy();
    return res.status(200).json({ success: true, message: 'تم حذف الكتاب من السلة' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'خطأ في حذف العنصر من السلة', error: error.message });
  }
};

// DELETE /api/cart
const clearCart = async (req, res) => {
  try {
    await CartItem.destroy({ where: { userId: req.user.id } });
    return res.status(200).json({ success: true, message: 'تم تفريغ السلة بنجاح' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'خطأ في تفريغ السلة', error: error.message });
  }
};

// POST /api/cart/checkout-whatsapp
// Builds the exact WhatsApp purchase message from user's cart (or passed bookIds for guest/direct checkout)
const checkoutViaWhatsApp = async (req, res) => {
  try {
    const items = await CartItem.findAll({
      where: { userId: req.user.id },
      include: [{ model: Book, as: 'book' }],
    });

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'السلة فارغة، يرجى إضافة كتب أولاً لإتمام طلب الشراء',
      });
    }

    const bookTitles = items.map((item) =>
      item.quantity > 1 ? `${item.book.title} (العدد: ${item.quantity})` : item.book.title
    );

    const whatsappOrder = generateOrderWhatsAppLink(bookTitles);

    return res.status(200).json({
      success: true,
      message: 'تم تجهيز رابط طلب الشراء عبر واتساب بنجاح',
      booksCount: items.length,
      requestedBooks: bookTitles,
      order: whatsappOrder,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'خطأ في تجهيز طلب واتساب', error: error.message });
  }
};

module.exports = {
  getMyCart,
  addToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
  checkoutViaWhatsApp,
};
