const asyncHandler = require("express-async-handler");
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

// function to generate jwt token.
const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: "1d"})
};


//.............. Register User................
const registerUser = asyncHandler(async (req, res) =>{
    const {name, email, password} = req.body

    //validation
    if(!name || !email || !password){
        res.status(400)
        throw new Error("please fill  in all required fields")
    }
    if(password.length < 6){
        res.status(400)
        throw new Error("password must be 6 characters")
    }

    // chech if user email already exists
    const userExist = await User.findOne({email})
    if(userExist){
        res.status(400)
        throw new Error("User email already regestered")
    }

    

    // create new user
    const user = await User.create({
        name,
        email,
        password
    });

    // generate tokken
    const token = generateToken(user._id);

    // send HTTP-only cookie
    res.cookie("token", token, {
        path: '/',
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 864000), // 1 day
        sameSite: "none", // it means we have different url for frontend and backend.
        secure: true // if we use https 
    });


    if(user){
        const {_id, name, email, photo, phone, bio} = user
        res.status(201).json({
            _id,
            name, 
            email, 
            photo, 
            phone, 
            bio,
            token
        })
    }else{
        res.status(400)
        throw new Error("Invalid user data");
    }


});

//------------- Login User---------------
const loginUser = asyncHandler(async (req, res) =>{
    res.send("login user")
});

module.exports = {
    registerUser,
    loginUser,
}