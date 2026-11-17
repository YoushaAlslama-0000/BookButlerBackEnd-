require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, Admin, Category } = require('../models');

const seedInitialData = async () => {
  try {
    await sequelize.sync();

    const username = process.env.SUPERADMIN_USERNAME || 'superadmin';
    const rawPassword = process.env.SUPERADMIN_PASSWORD || 'Admin@123456';

    const existingAdmin = await Admin.findOne({ where: { username } });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(rawPassword, 10);
      await Admin.create({
        username,
        password: hashedPassword,
        role: 'superadmin',
      });
      console.log(`✅ تم إنشاء حساب SuperAdmin بنجاح (اسم المستخدم: ${username})`);
    } else {
      console.log(`ℹ️ حساب SuperAdmin موجود مسبقاً (${username})`);
    }

    // Seed default book categories if empty
    const count = await Category.count();
    if (count === 0) {
      const defaultCategories = [
        { name: 'خيال علمي', description: 'روايات وكتب الخيال العلمي والمستقبل' },
        { name: 'غموض', description: 'كتب التحقيقات والألغاز والغموض' },
        { name: 'رومنسي', description: 'الروايات والقصص الرومانسية' },
        { name: 'أكشن', description: 'قصص المغامرة والإثارة والأكشن' },
      ];
      await Category.bulkCreate(defaultCategories);
      console.log('✅ تم إضافة أنواع الكتب الافتراضية (خيال علمي، غموض، رومنسي، أكشن)');
    }
  } catch (error) {
    console.error('❌ خطأ أثناء تهيئة البيانات الأولية:', error.message);
  }
};

if (require.main === module) {
  seedInitialData().then(() => process.exit(0));
}

module.exports = seedInitialData;
