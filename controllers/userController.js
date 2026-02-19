const bcrypt = require("bcrypt"); 
const UsersSignup = require("../models/usersSignup"); 

const addUser = async (req,res)=> {
   try {
     const {name,email,password} = req.body; 

    const existingUser = await UsersSignup.findOne({where:{email}});
    
    if(existingUser){
        return res.status(400).json({message: "User already exists"}); 
    }

    const hashedPassword = await bcrypt.hash(password,10); 

    await UsersSignup.create({
        name,
        email,
        password:hashedPassword
    }); 

    res.status(201).json({
        message:"User created successfully"
    }); 
   } catch (error) {
    console.log(error); 
    res.status(500).json({
            message: "Something went wrong"
        });
   }
}

module.exports = {
    addUser
}; 