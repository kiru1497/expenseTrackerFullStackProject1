const UsersSignup = require("./usersSignup");
const Expense = require("./expense");
const Order = require("./order");
const ForgotPasswordRequests = require("./forgotPasswordRequests");

UsersSignup.hasMany(Expense);
Expense.belongsTo(UsersSignup);

UsersSignup.hasMany(Order);
Order.belongsTo(UsersSignup);

UsersSignup.hasMany(ForgotPasswordRequests);
ForgotPasswordRequests.belongsTo(UsersSignup);

module.exports = {
  UsersSignup,
  Expense,
  Order,
  ForgotPasswordRequests,
};
