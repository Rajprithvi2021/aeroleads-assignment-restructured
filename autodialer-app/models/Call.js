const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Call = sequelize.define('Call', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('queued', 'ringing', 'in-progress', 'completed', 'failed', 'busy', 'no-answer'),
    defaultValue: 'queued',
  },
  duration: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  callSid: {
    type: DataTypes.STRING,
    unique: true,
  },
  startTime: { type: DataTypes.DATE },
  endTime: { type: DataTypes.DATE },
  errorMessage: { type: DataTypes.TEXT },
  metadata: { type: DataTypes.JSONB, defaultValue: {} }
}, {
  tableName: 'calls',
  timestamps: true
});

module.exports = Call;
