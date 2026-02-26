const { DataTypes } = require("sequelize");
const { sequelize } = require("../utils/db");

const Order = sequelize.define("Order", {
  orderId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

module.exports = Order;