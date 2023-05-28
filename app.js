const express = require('express');
const fs = require('fs');
const AppError = require('./utils/appErrors');
const GlobalErrorHandler = require('./controllers/errorController');
const morgan = require('morgan');
const tourRouter = require('./Routes/tourRoutes');
const userRouter = require('./Routes/userRoutes');
const app = express();



if(process.env.NODE_ENV==='development'){
    app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`))

app.use((req,res,next)=>{
    req.requestTime= new Date().toISOString();
    next();
})






app.use('/api/v1/tours',tourRouter);
app.use('/api/v1/users',userRouter);

app.all('*',(req,res,next)=>{

    next(new AppError(`can't find ${req.originalUrl} on this server`),404);
})

app.use(GlobalErrorHandler);



module.exports = app;