const User = require('./../models/userModel');
const {promisify} = require('util');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appErrors');
const crypto = require('crypto');
const sendEmail = require('../utils/email');

const bcrypt = require('bcryptjs');

const signToken = id=>{
    return jwt.sign({id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRES_IN
    })
}
exports.signUp = catchAsync(async(req,res,next)=>{
    const body = req.body;
    const newUser = await User.create({
        name:req.body.name,
        email:req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt:req.body.passwordChangedAt
    });
    const token = signToken(newUser._id);
    res.status(200).json({
        status:'success',
        token,
        data :{
            user:newUser
        }
    })


});

exports.login = catchAsync( async (req,res,next)=>{
    const {email,password}= req.body;

    // if email and password exist
    if(!email||!password){
        return next(new AppError('please provide email and password',400));
    }

    //if the user exists and password is correct
    const user  = await User.findOne({email}).select('+password');
  

    if(!user||! (await user.correctPassword(password,user.password)) ){
        return next(new AppError('incorrect email or password ',401));

    }
    //if everything is ok send token

    const token =signToken(user._id);
    res.status(200).json({
        status:'success',
        token
    })
});


exports.protect =  catchAsync( async (req,res,next)=>{
    let token;
    //getting the token and check if its there.
        if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
           token = req.headers.authorization.split(' ')[1];
        }
       
    //validate token
        if(!token){
            return next(new AppError('You are not logged in!, please log in to get access',401));
        }
    //check if user still exists
      const decoded= await promisify(jwt.verify)(token,process.env.JWT_SECRET);
     
 
    const freshUser =await User.findById(decoded.id);
    if(!freshUser){
      return next(new AppError('the user belonging to this token no longer exist ',401));
    }
    

       //if user changed password after the token was issued
      
    if(freshUser.changedPasswordAfter(decoded.iat)){
        return next(new AppError('the user changed the password. please login with recent password',401))
    }
    //grant access
    
    req.user = freshUser;
    next();
});

exports.restrictTo = (...roles)=>{
   
    return (req,res,next)=>{
        console.log(req.user);
        //roles is an array
        if(!roles.includes(req.user.role)){
            return next(new AppError('you do not have permission to perfom this action',403));
        }
        next();
    }
}

exports.forgotPassword = catchAsync(async(req,res,next)=>{
    //get user based on email

        const user = await User.findOne({email:req.body.email})
        if(!user){
            return next(new AppError('no user with this email'));
        }
       
    //generate random reset token
        const resetToken =  user.createPasswordResetToken();
        await user.save({validateBeforeSave:false});
    //send it to users email
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`
    
    const message = `forgot your password? submit a patch request with your new password and password confirm to 
    ${resetUrl}. if you didn't forget your password please ignore your email`;
try{
    await sendEmail({
        email: user.email,
        subject:'your password reset token(only valid for 10 mins)',
        message
    })
    res.status(200).json({
        status:'success',
        message:'token sent to email'
    })
}catch(err){
    user.passwordResetToken = undefined;
    user.passwordResetExpires=undefined;
    await user.save({validateBeforeSave:false});
    console.log(err);
    return next(new AppError('there was an error sending the email, try again later',500));
}
 
});

exports.resetPassword = async (req,res,next)=>{
    //get user based on the token.
    const hashedToken = crypto.createHash('sha256')
    .update(req.params.token)
    .digest('hex');

    const user = await User.findOne({passwordResetToken:hashedToken , passwordResetExpires:{$gt:Date.now()}});
    //if token has not expired and there is user, set the new password
    console.log(user);
    if(!user){
        return next(new AppError('Token is invalid!',400));
    }
    
    user.password= req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    //update changePasswordAt property for the current user

    //log the user in 
    const token =signToken(user._id);
    res.status(200).json({
        status:'success',
        token
    })
}