const UsersSignup = require("./usersSignup");
const Expense = require("./expense");

UsersSignup.hasMany(Expense);
Expense.belongsTo(UsersSignup);

module.exports = {
  UsersSignup,
  Expense
};