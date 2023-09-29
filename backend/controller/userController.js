const asyncHandler = require("express-async-handler");
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs");
const Token = require('../models/tokenModel');
const crypto = require('crypto');
const sendEmail = require("../utils/sendEmail");

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

// change password 
const changePassword = asyncHandler(async (req, res)=>{
    const user = await User.findById(req.user._id);

    const {oldPassword, password} = req.body;

    if(!user){
        res.status(400);
        throw new Error("User not found");
    }
    //validate
    if(!oldPassword || !password){
        res.status(400);
        throw new Error("Please old and new password.");
    }
    
    // check if password matches password in DB.
    const passwordIsCorrect = await bcrypt.compare(oldPassword, user.password);

    // save new password.
    if(user && passwordIsCorrect){
        user.password = password;
        await user.save();
        res.status(200).send("password changed sucessfull");
    } else {
        res.status(400);
        throw new Error("Old password is incorrect");
    }

});

// forgot password 
const forgotPassword = asyncHandler(async (req, res)=>{
    const {email} = req.body;
    const user = await User.findOne({email});

    if(!user){
        res.status(404);
        throw new Error("User does not exists.");
    }
    
    // Delete token if it exists in DB
    let token = await Token.findOne({userId: user._id});
    if(token){
        await token.deleteOne()
    }

    // create reset token.
    let resetToken = crypto.randomBytes(32).toString("hex") + user._id;

    // hash token before saving to db
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // saving the token to the database
    await new Token({
        userId: user._id,
        token: hashedToken,
        createdAt: Date.now(),
        expiresAt: Date.now() + 10 * (60*1000) // 10 minutes
    }).save()

    // construct reset url 
    const resetUrl = `${process.env.FORNTEND_URL}/resetpassword/${resetToken}`

    // reset email
    const message = `
        <h2>hello ${user.name}</h2>
        <p>Please use the line to reset your password</p>
        <p>This link is only valid for 10 minutes</p>

        <a href=${resetUrl} clicktraking=off>${resetUrl}</a>
        <p>regards,</p>
        <p>Inventex Team</p>
    `;
    const subject = "password reset requiest"
    const send_to = user.email
    const sent_from = process.env.EMAIL_USER
    try {
        await sendEmail(subject, message, send_to, sent_from)
        res.status(200).json({
            sucess: true,
            message: "reset email sent"
        })
    } catch (error) {
        res.status(500)
        throw new Error("Email not send, try again")
        
    }
});

// reset password
const resetpassword = asyncHandler(async(req, res)=>{
    res.send("reset password")
})



module.exports = {
    registerUser,
    loginUser,
    logout,
    getUser,
    loginStatus,
    updateUser,
    changePassword,
    forgotPassword,
    resetpassword
}