require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');
const seedInitialData = require('./utils/seedAdmin');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح');

    // Sync tables & seed SuperAdmin + default categories
    await sequelize.sync();
    await seedInitialData();

    app.listen(PORT, () => {
      console.log(`🚀 خادم Book Butler يعمل الآن على الرابط: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ فشل تشغيل الخادم:', error);
    process.exit(1);
  }
};

startServer();
