const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Book = sequelize.define('Book', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: 'المعرف الفريد للكتاب (ID)',
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'اسم الكتاب',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'وصف الكتاب',
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'مسار أو رابط صورة الكتاب',
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 0,
    },
    comment: 'السعر الأصلي للكتاب',
  },
  discountPercentage: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100,
    },
    comment: 'نسبة الحسم المئوية (0 إذا لم يوجد حسم)',
  },
  finalPrice: {
    type: DataTypes.VIRTUAL,
    get() {
      const price = this.getDataValue('price') || 0;
      const discount = this.getDataValue('discountPercentage') || 0;
      return Number((price - (price * discount) / 100).toFixed(2));
    },
  },
  hasDiscount: {
    type: DataTypes.VIRTUAL,
    get() {
      return (this.getDataValue('discountPercentage') || 0) > 0;
    },
  },
  isWeeklyPick: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'ضمن قائمة الترشيحات الأسبوعية',
  },
  isMonthlyPick: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'ضمن قائمة الترشيحات الشهرية',
  },
});

module.exports = Book;
