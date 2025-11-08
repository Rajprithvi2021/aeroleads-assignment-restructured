const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PhoneNumber = sequelize.define('PhoneNumber', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  number: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  name: { type: DataTypes.STRING },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active',
  },
  totalCalls: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  lastCalled: { type: DataTypes.DATE }
}, {
  tableName: 'phonenumbers',
  timestamps: true
});

module.exports = PhoneNumber;
