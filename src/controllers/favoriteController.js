const { User, Book, Category, Favorite } = require('../models');

// GET /api/favorites
const getMyFavorites = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [
        {
          model: Book,
          as: 'favoriteBooks',
          through: { attributes: ['createdAt'] },
          include: [{ model: Category, as: 'categories', through: { attributes: [] } }],
        },
      ],
    });

    return res.status(200).json({
      success: true,
      count: user.favoriteBooks.length,
      favorites: user.favoriteBooks,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'خطأ في جلب قائمة المفضلة', error: error.message });
  }
};

// POST /api/favorites/:bookId (Toggle Add/Remove Favorite)
const toggleFavorite = async (req, res) => {
  try {
    const bookId = Number(req.params.bookId);
    const book = await Book.findByPk(bookId);
    if (!book) {
      return res.status(404).json({ success: false, message: 'الكتاب غير موجود' });
    }

    const existing = await Favorite.findOne({
      where: { userId: req.user.id, bookId },
    });

    if (existing) {
      await existing.destroy();
      return res.status(200).json({
        success: true,
        isFavorite: false,
        message: 'تمت إزالة الكتاب من المفضلة',
      });
    }

    await Favorite.create({ userId: req.user.id, bookId });
    return res.status(201).json({
      success: true,
      isFavorite: true,
      message: 'تمت إضافة الكتاب إلى المفضلة',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'خطأ في تحديث المفضلة', error: error.message });
  }
};

module.exports = {
  getMyFavorites,
  toggleFavorite,
};
