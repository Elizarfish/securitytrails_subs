const { Sequelize } = require('sequelize');
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite'
});

const Studio = require('./Studio')(sequelize);
const User = require('./User')(sequelize);
const Booking = require('./Booking')(sequelize);

// Определяем связи между моделями
User.hasMany(Booking, { foreignKey: 'user_id' });
Studio.hasMany(Booking, { foreignKey: 'studio_id' });

Booking.belongsTo(User, { foreignKey: 'user_id' });
Booking.belongsTo(Studio, { foreignKey: 'studio_id' });

module.exports = {
  sequelize,
  Studio,
  User,
  Booking
};