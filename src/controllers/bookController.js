const { Op } = require('sequelize');
const { Book, Category } = require('../models');

// Helper to parse categoryIds sent via JSON or multipart/form-data
const parseCategoryIds = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(Number).filter(Boolean);
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map(Number).filter(Boolean);
    } catch (_) {
      return raw
        .split(',')
        .map((id) => Number(id.trim()))
        .filter(Boolean);
    }
  }
  return [];
};

const parseBoolean = (val) => {
  if (typeof val === 'boolean') return val;
  if (typeof val === 'string') return val.toLowerCase() === 'true' || val === '1';
  return Boolean(val);
};

// GET /api/books
// Supports searching by title/description (?search=...), filtering by categoryId (?categoryId=1) or categoryName (?category=خيال علمي),
// filtering discounted books (?discounted=true), weekly (?weekly=true), monthly (?monthly=true)
const getAllBooks = async (req, res) => {
  try {
    const { search, categoryId, category, discounted, weekly, monthly } = req.query;

    const whereClause = {};
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    if (discounted === 'true') {
      whereClause.discountPercentage = { [Op.gt]: 0 };
    }
    if (weekly === 'true') {
      whereClause.isWeeklyPick = true;
    }
    if (monthly === 'true') {
      whereClause.isMonthlyPick = true;
    }

    const categoryInclude = {
      model: Category,
      as: 'categories',
      through: { attributes: [] },
    };

    if (categoryId) {
      categoryInclude.where = { id: Number(categoryId) };
      categoryInclude.required = true;
    } else if (category) {
      categoryInclude.where = { name: { [Op.like]: `%${category}%` } };
      categoryInclude.required = true;
    }

    const books = await Book.findAll({
      where: whereClause,
      include: [categoryInclude],
      order: [['id', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      count: books.length,
      books,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'خطأ في جلب الكتب', error: error.message });
  }
};

// GET /api/books/recommendations
// Returns Weekly Picks and Monthly Picks lists
const getRecommendations = async (req, res) => {
  try {
    const include = [{ model: Category, as: 'categories', through: { attributes: [] } }];

    const [weeklyPicks, monthlyPicks] = await Promise.all([
      Book.findAll({ where: { isWeeklyPick: true }, include, order: [['updatedAt', 'DESC']] }),
      Book.findAll({ where: { isMonthlyPick: true }, include, order: [['updatedAt', 'DESC']] }),
    ]);

    return res.status(200).json({
      success: true,
      weeklyPicks,
      monthlyPicks,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'خطأ في جلب الترشيحات', error: error.message });
  }
};

// GET /api/books/:id
const getBookById = async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id, {
      include: [{ model: Category, as: 'categories', through: { attributes: [] } }],
    });

    if (!book) {
      return res.status(404).json({ success: false, message: 'الكتاب غير موجود' });
    }

    return res.status(200).json({ success: true, book });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'خطأ في جلب تفاصيل الكتاب', error: error.message });
  }
};

// POST /api/books (SuperAdmin only)
// Adds book with: image, title, description, price, discountPercentage, isWeeklyPick, isMonthlyPick, categoryIds
const createBook = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      discountPercentage,
      isWeeklyPick,
      isMonthlyPick,
      categoryIds,
      imageUrl,
    } = req.body;

    if (!title || !description || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'يرجى إدخال اسم الكتاب، وصف الكتاب، وسعر الكتاب',
      });
    }

    const numericPrice = parseFloat(price);
    const numericDiscount = discountPercentage !== undefined ? parseFloat(discountPercentage) : 0;

    if (isNaN(numericPrice) || numericPrice < 0) {
      return res.status(400).json({ success: false, message: 'سعر الكتاب يجب أن يكون رقماً صحيحاً موجباً' });
    }

    if (isNaN(numericDiscount) || numericDiscount < 0 || numericDiscount > 100) {
      return res.status(400).json({ success: false, message: 'نسبة الحسم يجب أن تكون بين 0 و 100' });
    }

    let imagePath = imageUrl || null;
    if (req.file) {
      imagePath = `/uploads/books/${req.file.filename}`;
    }

    const book = await Book.create({
      title: title.trim(),
      description: description.trim(),
      image: imagePath,
      price: numericPrice,
      discountPercentage: numericDiscount,
      isWeeklyPick: parseBoolean(isWeeklyPick),
      isMonthlyPick: parseBoolean(isMonthlyPick),
    });

    const parsedCategories = parseCategoryIds(categoryIds);
    if (parsedCategories.length > 0) {
      const validCategories = await Category.findAll({ where: { id: parsedCategories } });
      await book.setCategories(validCategories);
    }

    const createdBook = await Book.findByPk(book.id, {
      include: [{ model: Category, as: 'categories', through: { attributes: [] } }],
    });

    return res.status(201).json({
      success: true,
      message: 'تمت إضافة الكتاب بنجاح',
      book: createdBook,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'خطأ في إضافة الكتاب', error: error.message });
  }
};

// PUT /api/books/:id (SuperAdmin only)
const updateBook = async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'الكتاب غير موجود' });
    }

    const {
      title,
      description,
      price,
      discountPercentage,
      isWeeklyPick,
      isMonthlyPick,
      categoryIds,
      imageUrl,
    } = req.body;

    if (title !== undefined) book.title = title.trim();
    if (description !== undefined) book.description = description.trim();
    if (price !== undefined) book.price = parseFloat(price);
    if (discountPercentage !== undefined) book.discountPercentage = parseFloat(discountPercentage);
    if (isWeeklyPick !== undefined) book.isWeeklyPick = parseBoolean(isWeeklyPick);
    if (isMonthlyPick !== undefined) book.isMonthlyPick = parseBoolean(isMonthlyPick);

    if (req.file) {
      book.image = `/uploads/books/${req.file.filename}`;
    } else if (imageUrl !== undefined) {
      book.image = imageUrl;
    }

    await book.save();

    if (categoryIds !== undefined) {
      const parsedCategories = parseCategoryIds(categoryIds);
      const validCategories = await Category.findAll({ where: { id: parsedCategories } });
      await book.setCategories(validCategories);
    }

    const updatedBook = await Book.findByPk(book.id, {
      include: [{ model: Category, as: 'categories', through: { attributes: [] } }],
    });

    return res.status(200).json({
      success: true,
      message: 'تم تحديث بيانات الكتاب بنجاح',
      book: updatedBook,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'خطأ في تحديث الكتاب', error: error.message });
  }
};

// PATCH /api/books/:id/recommendations (SuperAdmin only)
// Quick toggle for Weekly & Monthly recommendations
const toggleBookRecommendations = async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'الكتاب غير موجود' });
    }

    const { isWeeklyPick, isMonthlyPick } = req.body;
    if (isWeeklyPick !== undefined) book.isWeeklyPick = parseBoolean(isWeeklyPick);
    if (isMonthlyPick !== undefined) book.isMonthlyPick = parseBoolean(isMonthlyPick);

    await book.save();
    return res.status(200).json({
      success: true,
      message: 'تم تحديث حالة ترشيح الكتاب بنجاح',
      book,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'خطأ في تحديث الترشيحات', error: error.message });
  }
};

// DELETE /api/books/:id (SuperAdmin only)
const deleteBook = async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'الكتاب غير موجود' });
    }

    await book.destroy();
    return res.status(200).json({ success: true, message: 'تم حذف الكتاب بنجاح' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'خطأ في حذف الكتاب', error: error.message });
  }
};

module.exports = {
  getAllBooks,
  getRecommendations,
  getBookById,
  createBook,
  updateBook,
  toggleBookRecommendations,
  deleteBook,
};
