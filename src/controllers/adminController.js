const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Admin, Book, Category, User } = require('../models');

// POST /api/admin/login
const loginSuperAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'يرجى إدخال اسم المستخدم وكلمة المرور للـ SuperAdmin',
      });
    }

    const admin = await Admin.findOne({ where: { username } });
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'بيانات الدخول غير صحيحة',
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'بيانات الدخول غير صحيحة',
      });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username, type: 'superadmin' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'تم تسجيل دخول SuperAdmin بنجاح',
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        role: admin.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'خطأ في الخادم', error: error.message });
  }
};

// GET /api/admin/dashboard
const getDashboardStats = async (req, res) => {
  try {
    const [totalBooks, discountedBooks, weeklyPicksCount, monthlyPicksCount, totalCategories, totalUsers] =
      await Promise.all([
        Book.count(),
        Book.count({ where: { discountPercentage: { [require('sequelize').Op.gt]: 0 } } }),
        Book.count({ where: { isWeeklyPick: true } }),
        Book.count({ where: { isMonthlyPick: true } }),
        Category.count(),
        User.count(),
      ]);

    const recentBooks = await Book.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [{ model: Category, as: 'categories', through: { attributes: [] } }],
    });

    return res.status(200).json({
      success: true,
      dashboard: {
        stats: {
          totalBooks,
          discountedBooks,
          weeklyPicksCount,
          monthlyPicksCount,
          totalCategories,
          totalUsers,
        },
        recentBooks,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'خطأ في جلب بيانات لوحة التحكم', error: error.message });
  }
};

module.exports = {
  loginSuperAdmin,
  getDashboardStats,
};
