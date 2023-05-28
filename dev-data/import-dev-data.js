const fs = require('fs');
const dotenv = require('dotenv');
const tour = require('../models/tourModels');
const mongoose = require('mongoose');
dotenv.config({path:'../config.env'});



const DB = process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD);

 
mongoose.connect(DB).then(con=>{console.log('DB connection Successful')});

const tours = JSON.parse(fs.readFileSync(`${__dirname}/data/tours-simple.json`,'utf-8'));
const importData = async()=>{
    try{
        await tour.create(tours)
        console.log('data successfully loaded');
    }catch(err){
        console.log(err);
    }
}
const deleteData = async()=>{
    try{
        await tour.deleteMany({});
        console.log('data deleted successfully');
    }catch(err){
        console.log(err);
    }
}

if(process.argv[2]==="--import"){
    importData();
}else if(process.argv[2]==="--delete"){
    deleteData();
}

console.log(process.argv);