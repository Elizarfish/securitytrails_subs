const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Studio = sequelize.define('Studio', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    price_per_hour: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    image_url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    equipment: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    max_capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10
    },
    is_available: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  });

  return Studio;
};