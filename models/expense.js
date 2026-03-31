const { DataTypes } = require("sequelize");
const { sequelize } = require("../utils/db");

const Expense = sequelize.define("Expense", {
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  note: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = Expense;
