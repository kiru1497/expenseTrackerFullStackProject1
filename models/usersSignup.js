const { DataTypes } = require("sequelize");
const { sequelize } = require("../utils/db");

const usersSignup = sequelize.define("usersSignup", {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    isPremium: {                     
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
});

module.exports = usersSignup;