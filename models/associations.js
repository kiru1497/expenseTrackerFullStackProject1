const UsersSignup = require("./usersSignup");
const Expense = require("./expense");
const Order = require("./order");

UsersSignup.hasMany(Expense);
Expense.belongsTo(UsersSignup);

UsersSignup.hasMany(Order);
Order.belongsTo(UsersSignup);

module.exports = {
  UsersSignup,
  Expense,
  Order
};