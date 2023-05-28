const mongoose = require('mongoose');
const validator = require('validator');
const { default: slugify } = require('slugify');
const slufigy = require('slugify');
const tourSchema = new mongoose.Schema({
    name: {
        type:String,
        required:[true, "A tour must have a name"],
        unique:true,
        trim:true,
        // validate:[validator.isAlpha,'name must contain alphabets only']
    },
    slug:String,
    duration:{
        type:Number,
        required:[true,"A tour must have a duration."]
    },
    maxGroupSize:{
        type:Number,
        required:[true, "A tour must have a group size."]
    },
    difficulty:{
        type:String,
        required:[true,"A tour must have a difficulty"],
        enum:{
            values:['easy','medium','difficult'],
            message: 'difficulty should be easy, medium or difficult'
        }
    },
    ratingsAverage: {
        type: Number,
        default:4.5,
        min:[1,'rating must be above 1'],
        max:[5, 'rating must be below 5'] 
    },
    ratingsQuantity:{
        type:Number,
        default:0
    },
 

    
    price:{
        type:Number,
        required:[true, "A tour must have a price"]
    },
    priceDiscount: Number,
    summary: {
        type:String,
        trim:true,
        required:[true,"A tour must have a Summary"]
    },
    description:{
        type:String,
        trim:true,
       
    },
    isSecret:{
        type: Boolean,
        default: false
    },
    imageCover:{
        type:String,
        required:[true,"A tour must have a cover Image"]
    },
    images: [String],
    createdAt:{
        type: Date,
        default:Date.now(),
        select: false
    },
    startDates:[Date]

},{
    toJSON:{
        virtuals:true
    },
    toObject:{virtuals:true}
})
tourSchema.virtual('durationWeeks').get(function(){
    return this.duration/7;
})

tourSchema.pre('save',function(next){
    this.slug = slugify(this.name,{lower:true});
    next();
})

tourSchema.pre('find',function(next){
   
    this.find({isSecret:{$ne:true}})
    next();
})
// tourSchema.post('save',function(doc,next){
//     console.log(doc);
//     next();
// })
const Tour = mongoose.model('Tour',tourSchema);

module.exports = Tour;