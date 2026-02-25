const express = require("express"); 
const app = express(); 
const session = require("express-session");
const path = require("path"); 


const userRoutes = require("./routes/userRoutes"); 
const expenseRoutes = require("./routes/expenseRoutes"); 

app.use(express.json()); 
app.use(session({
  secret: "mysecretkey",
  resave: false,
  saveUninitialized: false
}));
app.use(express.static(path.join(__dirname,"public"))); 

app.use("/user",userRoutes); 
app.use("/",expenseRoutes); 

const {connectDb, sequelize} = require("./utils/db"); 

require("./models/associations"); 

const startServer = async()=>{
    try {
        await connectDb(); 
        console.log("DB connection verified"); 

        await sequelize.sync(); 
        console.log("All models synced")

        app.listen(3000,()=>{
            console.log("Serving is running on port 3000"); 
        })
    } catch (error) {
        console.log("Failed to start server:",error); 
    }
}

startServer(); 