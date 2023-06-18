const dotenv = require("dotenv").config();
const bodyParser = require("body-parser");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();


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