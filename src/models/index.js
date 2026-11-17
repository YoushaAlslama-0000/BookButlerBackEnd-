const sequelize = require('../config/database');
const Admin = require('./Admin');
const User = require('./User');
const Category = require('./Category');
const Book = require('./Book');
const Favorite = require('./Favorite');
const CartItem = require('./CartItem');

// Book <-> Category (Many-to-Many so a book can have one or multiple genres/types)
Book.belongsToMany(Category, {
  through: 'BookCategories',
  as: 'categories',
  foreignKey: 'bookId',
});
Category.belongsToMany(Book, {
  through: 'BookCategories',
  as: 'books',
  foreignKey: 'categoryId',
});

// User <-> Book (Favorites)
User.belongsToMany(Book, {
  through: Favorite,
  as: 'favoriteBooks',
  foreignKey: 'userId',
});
Book.belongsToMany(User, {
  through: Favorite,
  as: 'favoritedBy',
  foreignKey: 'bookId',
});
Favorite.belongsTo(User, { foreignKey: 'userId' });
Favorite.belongsTo(Book, { foreignKey: 'bookId' });

// User <-> CartItem <-> Book
User.hasMany(CartItem, { foreignKey: 'userId', as: 'cartItems', onDelete: 'CASCADE' });
CartItem.belongsTo(User, { foreignKey: 'userId' });

Book.hasMany(CartItem, { foreignKey: 'bookId', onDelete: 'CASCADE' });
CartItem.belongsTo(Book, { foreignKey: 'bookId', as: 'book' });

module.exports = {
  sequelize,
  Admin,
  User,
  Category,
  Book,
  Favorite,
  CartItem,
};
