const jwt = require('jsonwebtoken');
const { Admin, User } = require('../models');

// Verify SuperAdmin Token
const protectAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'غير مصرح بالدخول، يرجى تسجيل الدخول كـ SuperAdmin' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'صلاحيات غير كافية، هذا المسار مخصص لـ SuperAdmin فقط' });
    }

    const admin = await Admin.findByPk(decoded.id, { attributes: { exclude: ['password'] } });
    if (!admin) {
      return res.status(401).json({ success: false, message: 'حساب المشرف غير موجود' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'رمز التحقق غير صالح أو منتهي الصلاحية' });
  }
};

// Verify Regular User Token
const protectUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'يرجى تسجيل الدخول أولاً' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type !== 'user') {
      return res.status(403).json({ success: false, message: 'رمز دخول غير صالح للمستخدم' });
    }

    const user = await User.findByPk(decoded.id, { attributes: { exclude: ['password'] } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'المستخدم غير موجود' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'رمز التحقق غير صالح أو منتهي الصلاحية' });
  }
};

module.exports = { protectAdmin, protectUser };
