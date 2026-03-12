const {Sequelize} = require("sequelize"); 

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: "mysql",
        logging: false
    }
);

const connectDb = async()=>{
    try {
        await sequelize.authenticate(); 
        console.log("Sequelize connected to expensefullstackdb"); 
    } catch (error) {
        console.log("Database connection failed:",error); 
    }
}; 

module.exports={
    sequelize,
    connectDb
}