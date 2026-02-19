const {Sequelize} = require("sequelize"); 

const sequelize = new Sequelize("expensefullstackdb","root","Edu@Games1973",{
    host:"localhost",
    dialect:"mysql",
    logging:false
}); 

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