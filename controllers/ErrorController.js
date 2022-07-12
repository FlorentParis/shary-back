const AppError = require('./../utils/appError');
require('dotenv').config()
console.log(process.env.NODE_ENV);

//TODO DEBUG RangeError [ERR_HTTP_INVALID_STATUS_CODE]: Invalid status code: undefined
const handleDuplicateFieldsDB = (err) => {
    const message = `Duplicate field value: "${err.keyValue
        .email}". Please use another value!`;

    return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map((el) => el.message);
    const message = `Invalid Input Data. ${errors.join('. ')}`;

    return new AppError(message, 400);
};

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path} : ${err.value}.`;
    return new AppError(message, 400)
}

const sendErrorDev = (err, res)=> {
    res.status(err.statusCode).json({
        status :err.status,
        error: err,
        message: err.message,
        stack : err.stack
    });
}

const sendErrorProd = (err, res)=>{
    if(err.isOperational){
        res.status(err.statusCode).json({
            status :err.status,
            message: err.message
        });
    }else{
        console.log('ERROR ', err);
        res.status(500).json({
            status:'error',
            message: 'something went wrong!'
        });
    }

}

const handleNodemailerError = (err, res)=> {
    const message = `Bad request - email not sent`;
    return new AppError(message, 400)
}

module.exports = (err, req, res, next)=>{
    //console.log(err.stack);
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if(process.env.NODE_ENV === "development"){
        sendErrorDev(err,res);
    }else if (process.env.NODE_ENV === "production"){
        console.log("prod")
        let error = { ...err };
        console.log(error);
        if(error.name === 'CastError') error = handleCastErrorDB(error);
        if(error.name === 'ValidationError')
            error = handleValidationErrorDB(error);
        if(error.code === 11000) {
            console.log('erreur 11000')
            error = handleDuplicateFieldsDB(error);
        }
        if(error.code === "EAUTH"){
            error = handleNodemailerError(error);
        }
        sendErrorProd(error, res);
    }
};