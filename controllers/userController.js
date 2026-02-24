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

const loginUser = async(req,res)=>{
    try {
        const {email,password} = req.body; 

        const user = await UsersSignup.findOne({where: {email}}); 

        if(!user){
            return res.status(404).json({
                message:"User not found"
            }); 
        }
        
        const isPasswordValid = await bcrypt.compare(password, user.password); 

        if(!isPasswordValid){
            return res.status(401).json({
                message:"Incorrect Password"
            }); 
        }

        return res.status(200).json({
            message:"User login successful"
        })

    } catch (error) {
        console.log(error); 
        return res.status(500).json({
            message:"Something went wrong"
        }); 
    }
}

module.exports = {
    addUser, 
    loginUser
}; 