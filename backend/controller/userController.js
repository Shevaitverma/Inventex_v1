const asyncHandler = require("express-async-handler");
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs");

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
    const {email, password} = req.body

    // validation request
    if(!email || !password){
        res.status(400);
        throw new Error("please add email and password");
    }

    //check if user exists.
    const user = await User.findOne({email});
    if(!user){
        res.status(400);
        throw new Error("User not found.");
    }
    

    // check if password is correct.
    const  passwordIsCorrect = await bcrypt.compare(password, user.password)

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
    if(user && passwordIsCorrect){
        const {_id, name, email, photo, phone, bio} = user;
        res.status(201).json({
            _id,
            name, 
            email, 
            photo, 
            phone, 
            bio,
            token
        });
    } else {
        res.status(400);
        throw new Error("invalid email or password");
    }
});

// ----------- logout user-----------
const logout = asyncHandler(async (req, res)=>{
    
    
    // expireing the HTTP-only cookie
    res.cookie("token", "", {
        path: '/',
        httpOnly: true,
        expires: new Date(0), // expire cookie right now
        sameSite: "none",
        secure: true  
    });
    return res.status(200).json({ message: "sucessfully logged out." })
});

// ------------ get user data--------
const getUser = asyncHandler(async (req, res)=>{
    const user = await User.findById(req.user._id);

    if(user){
        const {_id, name, email, photo, phone, bio} = user;
        res.status(201).json({
            _id,
            name, 
            email, 
            photo, 
            phone, 
            bio,
        });
    } else{
        res.send(400);
        throw new Error("User not found . ");
    }
});

// get login status .. 
const loginStatus = asyncHandler(async (req, res)=>{
    const token = req.cookies.token;
    if(!token){
        return res.json(false);
    }
    //verify
    const verifyed = jwt.verify(token, process.env.JWT_SECRET);
    if(verifyed){
        return res.json(true);
    } 
    return res.json(false);
});

//----------------- update user----------------
const updateUser = asyncHandler(async (req, res)=>{
    const user = await User.findById(req.user._id);

    if(user){
        const { name, email, photo, phone, bio} = user;
        user.email = email;
        user.name = req.body.name || name;
        user.phone = req.body.phone || phone;
        user.bio = req.body.bio || bio;
        user.photo = req.body.photo || photo;

        const updatedUser = await user.save();
        res.status(200).json({
            _id: updatedUser._id,
            name: updatedUser.name, 
            email: updatedUser.email, 
            photo: updatedUser.photo, 
            phone: updatedUser.phone,
            bio: updatedUser.bio,
        })
    } else {
        res.status(404);
        throw new Error("User not found..")
    }
});


module.exports = {
    registerUser,
    loginUser,
    logout,
    getUser,
    loginStatus,
    updateUser
}