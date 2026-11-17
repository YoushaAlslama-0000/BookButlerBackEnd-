const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { generateSupportWhatsAppLink } = require('../utils/whatsappHelper');

// POST /api/auth/register
// Register using: email, fullName (الاسم الثلاثي), password, confirmPassword
const registerUser = async (req, res) => {
  try {
    const { email, fullName, password, confirmPassword } = req.body;

    if (!email || !fullName || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'جميع الحقول مطلوبة: البريد الإلكتروني، الاسم الثلاثي، كلمة المرور، وتأكيد كلمة المرور',
      });
    }

    const trimmedName = fullName.trim();
    const nameParts = trimmedName.split(/\s+/);
    if (nameParts.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'يرجى إدخال الاسم الثلاثي كاملاً (ثلاثة مقاطع على الأقل)',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'كلمة المرور وتأكيد كلمة المرور غير متطابقتين',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل',
      });
    }

    const existingEmail = await User.findOne({ where: { email: email.trim().toLowerCase() } });
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: 'البريد الإلكتروني مستخدم مسبقاً',
      });
    }

    const existingName = await User.findOne({ where: { fullName: trimmedName } });
    if (existingName) {
      return res.status(409).json({
        success: false,
        message: 'الاسم الثلاثي مسجل مسبقاً، يرجى استخدام اسم آخر أو تسجيل الدخول',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email: email.trim().toLowerCase(),
      fullName: trimmedName,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { id: user.id, fullName: user.fullName, type: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'تم إنشاء الحساب بنجاح',
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'خطأ في إنشاء الحساب', error: error.message });
  }
};

// POST /api/auth/login
// Login using: fullName (الاسم الثلاثي) and password
const loginUser = async (req, res) => {
  try {
    const { fullName, password } = req.body;

    if (!fullName || !password) {
      return res.status(400).json({
        success: false,
        message: 'يرجى إدخال الاسم الثلاثي وكلمة المرور',
        support: generateSupportWhatsAppLink(),
      });
    }

    const user = await User.findOne({ where: { fullName: fullName.trim() } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'الاسم الثلاثي أو كلمة المرور غير صحيحة',
        support: generateSupportWhatsAppLink(),
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'الاسم الثلاثي أو كلمة المرور غير صحيحة',
        support: generateSupportWhatsAppLink(),
      });
    }

    const token = jwt.sign(
      { id: user.id, fullName: user.fullName, type: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'خطأ في تسجيل الدخول', error: error.message });
  }
};

// GET /api/auth/profile
const getUserProfile = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
};

// GET /api/auth/support
const getSupportContact = (req, res) => {
  return res.status(200).json({
    success: true,
    support: generateSupportWhatsAppLink(),
  });
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  getSupportContact,
};
