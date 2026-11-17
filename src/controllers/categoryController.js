const { Category, Book } = require('../models');

// GET /api/categories
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [['id', 'ASC']],
    });
    return res.status(200).json({ success: true, categories });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'خطأ في جلب أنواع الكتب', error: error.message });
  }
};

// POST /api/categories (SuperAdmin only)
const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'يرجى إدخال اسم نوع الكتاب' });
    }

    const existing = await Category.findOne({ where: { name: name.trim() } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'هذا النوع موجود مسبقاً' });
    }

    const category = await Category.create({
      name: name.trim(),
      description: description || null,
    });

    return res.status(201).json({
      success: true,
      message: 'تمت إضافة نوع الكتاب بنجاح',
      category,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'خطأ في إضافة النوع', error: error.message });
  }
};

// PUT /api/categories/:id (SuperAdmin only)
const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'النوع غير موجود' });
    }

    const { name, description } = req.body;
    if (name) category.name = name.trim();
    if (description !== undefined) category.description = description;

    await category.save();
    return res.status(200).json({ success: true, message: 'تم تحديث النوع بنجاح', category });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'خطأ في تحديث النوع', error: error.message });
  }
};

// DELETE /api/categories/:id (SuperAdmin only)
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'النوع غير موجود' });
    }

    await category.destroy();
    return res.status(200).json({ success: true, message: 'تم حذف النوع بنجاح' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'خطأ في حذف النوع', error: error.message });
  }
};

module.exports = {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
