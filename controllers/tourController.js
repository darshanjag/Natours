const fs = require('fs');
const Tour = require('../models/tourModels');
const { query } = require('express');
const AppError = require('../utils/appErrors');
const ApiFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');



exports.aliasTopTours =(req,res,next)=>{
   
    req.query.limit = 5;
    req.query.sort="-averageRatings,price";
    req.query.fields="name,price,averageRatings,difficulty";
  
    
    next();
}






exports.getALLTours = catchAsync(async(req,res,next)=>{
    const features = new ApiFeatures(Tour.find(),req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
    const tours = await features.query;



    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            tours
        }
    })

});
exports.getTour = catchAsync(async (req,res)=>{
    const tour = await Tour.findById(req.params.id);
    console.log('yes');
    if(!tour){
        return new AppError('No Tour Found with that Id',404);
    }
    res.status(200).json({
        status:'success',
        data:{
            tour
        }
    })
});
exports.postTour = catchAsync(async(req,res)=>{
    const newTour= await Tour.create(req.body);
    res.status(200).json({
        status:'success',
        data: {
            tour:newTour
        }
    })
});
exports.patchTour = catchAsync(async (req,res)=>{
    const tour = await Tour.findByIdAndUpdate(req.params.id,req.body,{
        new: true,
        runValidators:true
    });

    res.status(200).json({
        status: 'success',
    
        data: {
            tour
        }
    })

});
exports.deleteTour = catchAsync( async(req,res)=>{
  
    const tour = await Tour.findByIdAndDelete(req.params.id);

    res.status(200).json({
        status: 'success',
        data:null
    })
})

exports.getTourStats = async(req,res)=>{
    try{
        const stats = await Tour.aggregate([
            {
                $match: {ratingsAverage:{$gte:4.5}}
            },
            {
                $group:{
                    _id:'$difficulty',
                    num:{$sum:1},
                    numRatings:{$sum:'$ratingsQuantity'},
                    avgRating:{$avg: '$ratingsAverage'},
                    avgPrice:{$avg:'$price'},
                    minPrice:{$min: '$price'},
                    maxPrice: {$max:'$price'}
                }
            }
        ])

        res.status(200).json({
            status:'success',
            data:{
                stats
            }
        })

    }catch(err){
        console.log(err);
        res.status(400).json({
            
            status:'fail',
            message:err.message
        })
    }
}