const express = require('express');
const dotenv = require('dotenv');
const app = require('./app');
const mongoose = require('mongoose');
dotenv.config({path:'./config.env'});

const DB = process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD);

 
mongoose.connect(process.env.DATABASE_LOCAL).then(con=>{console.log('DB connection Successful')});



const port =process.env.PORT;
app.listen(port,()=>{
    console.log(`app running on port ${port}...`);
})

