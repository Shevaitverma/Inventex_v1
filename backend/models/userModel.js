const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
    name:{
        type: String,
        require: [true, "please add a name"]
    },
    email:{
        type: String,
        require: [true, "please add a name"],
        unique: true,
        trim: true,
        match:[
            /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
            "please enter a valid email"
        ]
    },
    password:{
        type: String,
        require: [true, "please add a password"],
        minLength: [6, "password must be up to 6 characters"]
    },
    photo:{
        type: String,
        require: [true, "please add a photo"],
        default: "https://i.ibb.co/ZKz9yKP/default-avatar-profile-icon-of-social-media-user-vector.jpg",

    },
    phone:{
        type: String,
        default: "+91",
    },
    bio:{
        type: String,
        maxLength: [250,"Bio must not be more than 250 characters"],
        default: "bio"
    },   
},
{
    timestamps:true,
});

// password encryption  

// pre() is used to modify the data.  
userSchema.pre("save", async function(next) {
    if(!this.isModified("password")){
        return next();
    }

    //hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    next();
});



const User = mongoose.model("User",userSchema)
module.exports = User