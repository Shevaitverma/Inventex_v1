const dotenv = require("dotenv").config();
const bodyParser = require("body-parser");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const userRoute = require('./routes/userRoute');
const errorHandler = require('./middleWare/errorMiddleware');
const cookieParser = require('cookie-parser');


const app = express();

// middlewares 
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cookieParser())

// routes middlewares
app.use("/api/users", userRoute)


//route 
app.get("/", (req, res)=> {res.send("homepage")});


// error middleware
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
//connect to db and start server 
mongoose
    .connect(process.env.MONGO_URI)
    .then(()=>{
        app.listen(PORT, ()=>{
            console.log(`Server is running at ${PORT}`);
        })
    })
    .catch((err) => console.log(err));