const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')

const UserSchema = new mongoose.Schema({
    lastname:{
        type: String,
        required: [true, "Please tell us your name!"]
    },
    firstname:{
        type: String,
        required: [true, "Please tell us your name!"]
    },
    phone:{
      type:  String,
    },
    email:{
        type: String,
        required: [true, "Please provide your email!"],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, "Please provide a valid Email!"]
    },
    password:{
        type: String,
        required: [true, "Please provide a password"],
    },
    passwordConfirm: {
        type: String,
        required : [true, "Please confirm your password"],
        //this only works on save or create
        validate:{
            validator: function (el){
                return el === this.password;
            },
            message : 'Password are not the same'
        }
    },
    newsLetter: {
        type: Boolean,
        default:false
    },
    description:{
        type: String
    },
    birthday:{
      type : String
    },
    status : {
        type : String,
        enum : ['Pending', 'Active', 'Désactivé'],
        default : 'Pending'
    },
    img:
    {
        type : String,
        default : 'https://res.cloudinary.com/dr7db2zsv/image/upload/v1657014631/ij8qgts5uouifonqjj6w.png'
    },
    createAt : {
        type : Date,
        default : Date.now
    }
})

/*  Password hash
UserSchema.pre('save', async function(next){
    console.log("******** Password hash middleware");
    //only run this function if password was actually modified
    if(!this.isModified('password')) return next();

    //hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);
    //console.log(this.password);
    //Delete password confirm
    this.passwordConfirm = undefined;
    next();
})*/

const User = mongoose.model('Users', UserSchema)
module.exports = User