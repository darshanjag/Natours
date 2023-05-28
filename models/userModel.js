const mongoose = require('mongoose');
const validator =require('validator');
const bycrypt = require('bcryptjs');
const bcrypt = require('bcryptjs/dist/bcrypt');
const crypto = require('crypto');
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,'please tell us your name']
    },
    email:{
        type:String,
        required:[true,'please tell us your email'],
        unique:true,
        lowercase:true,
        validate: [validator.isEmail]
    },

    photo:{
        type:String
    },
    role:{
        type:String,
        enum: ['user','guide','lead-guide','admin'],
        default:'user'
    },
 
    password:{
        type:String,
        required:[true,'please provide a password'],
        minlength:5,
        select:false
    },
    passwordConfirm:{
        type:String,
        required:[true,'please confirm your password'],
        validate: {
            validator:function(el){
                return el==this.password
            },
            message:'passwords do not match'
        }
    },
    passwordChangedAt:Date,
    passwordResetToken:String,
    passwordResetExpires:Date
  
})
userSchema.pre('save',async function(next){
    //only run this function if password
    if(!this.isModified('password')){
        return next();
    }
    this.password = await bcrypt.hash(this.password,12);
    this.passwordConfirm = undefined;
    next();
})

userSchema.pre('save', function(next){
    if(!this.isModified('password')|| this.isNew) return next();
 this.passwordChangedAt = Date.now()-1000;
 next();
})

userSchema.methods.correctPassword= async function(candidatepassword,password){
    return await bcrypt.compare(candidatepassword,password);
}

userSchema.methods.changedPasswordAfter =  function(JWTTimeStamp){
    if(this.passwordChangedAt){
        const changedTimeStamp = parseInt(this.passwordChangedAt.getTime()/1000,10);
    
        return JWTTimeStamp < changedTimeStamp;
    }
    return false;
}

userSchema.methods.createPasswordResetToken = function(){
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken=  crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex'); 

    console.log({resetToken}, this.passwordResetToken);

    this.passwordResetExpires= Date.now()+10 *60*1000;
    return resetToken;
}
const User = mongoose.model('User',userSchema);

module.exports = User;