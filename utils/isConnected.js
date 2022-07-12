var Cookies = require( "cookies" )
const { promisify } = require('util')
var jwt  = require('jsonwebtoken')
const AppError = require('../utils/appError')

async function isConnected(req, res, next){
    const token = new Cookies(req,res).get('access_token');  
    if(token) {
        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
        if (next){
            console.log("next")
            next();
        } else 
        {
            console.log("return")
          return decoded.id;
        }
    }
    else {
        if (next){
            return next(new AppError("Tu n'es pas connecté", 404));
        } else
        {
            return "Not connected"
        }
    }
}

module.exports = {
    isConnected
}