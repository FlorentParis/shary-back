const User = require('../models/User.js')
const nodemailer = require('nodemailer');
require('dotenv').config()
const { json } = require('body-parser');
const bcrypt = require('bcrypt')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError');
var Cookies = require( "cookies" );
const { promisify } = require('util')
var jwt  = require('jsonwebtoken');
const { acceptInvitation } = require('../utils/acceptInvitation')
const { isConnected } = require('../utils/isConnected')


function hidePw(User){
    User.password = undefined;
    User.passwordConfirm = undefined;
}

const createUser = catchAsync(async(req, res, next) => {
    let data = req.body;
    //Take datas we want only
    const newUser = await User.create(data);

    //const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRES_IN});

    // Send email with a link to activate the account
    const mailSent = await sendMailActivation(data);
    console.log(mailSent);

    hidePw(newUser);
    // Send result json if success else catch error with catch Async and send error name
    res.status(200).json({
            status: 'success',
            data: {
                newUser
            },
            message : "Email nodemailer sent"
        }
    );

})

// Doc : https://nodemailer.com/usage/
const sendMailActivation = async (data)=> {
    // To send email you need a transporter object
    // TODO à mettre dans un SendMailController ou autre fichier pour qu'on puisse récupèrer ce code et envoyer d'autre mail
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: "OAuth2",
            user: "symchowiczbenji@gmail.com",
            clientId: "828571010780-5qkqqvb2d0ensbl7qqtq8scsi967r6cc.apps.googleusercontent.com",
            clientSecret: process.env.GOOGLE_OAUTH2_KEYS, //Key to configure
            refreshToken: "1//04Xq2X3b-NsYbCgYIARAAGAQSNwF-L9IrYZkIO6cNd8ERMuWJJArLPXplJM7xv-0s4Z2Z-vGV2zih2VGU2Dlq0hrHjC7E1iKQ41M"
        }
    });

    const message = {
        from: "symchowiczbenji@gmail.com", // sender address
        to: data.email, // list of receivers
        subject: "Activation de votre compte Shary !", // Subject line
        text: "data.contenu", // plaintext body
        html: "Salut a toi <b>" + data.firstname + " " + data.lastname + "</b><br/>Pourrais tu nous confirmer qu'il s'agit bien de ton mail : " + data.email + "<br/>Si c'est bien le cas, cliques ici pour nous le confirmer et nous activerons ton compte: <a href='http://localhost:3030/api/user/emailVerification/?email=" + data.email + "'> CLIQUES ICI POTO !!!</a><br/> Merci et a bientot !<br/>Shary" // html body
    }
    return await transporter.sendMail(message);
}

const getAllUsers = catchAsync(async(req, res, next)=> { 

    let users = await User.find();    
    users = users.map ( (user) => {
        user.password = undefined;
        user.passwordConfirm = undefined;
        return user;
    });
    res.status(200).json({
            status: 'success',
            results: users.length,
            data: {
                users   
            }
    })
    
})

const getUserById = catchAsync(async(req, res, next)=> { 
    let data = req.query
    let user = await User.findById(data._id);
    //console.log("GET USER BY ID : " + user)

    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    })
})

// Function not used, we return the user objet when creating or connecting
const getCurrentUser = catchAsync(async(req, res, next)=> {
    let id = await isConnected(req, res);
    const user = await User.findById(id) //User.findOne({ _id : req.params.id})
    if(!user){
        return next(new AppError('No User found with that ID', 404))
    }
    hidePw(user);
    res.status(200).json({
        status:'success',
        data:{
            user
        }
    });
})

const activateAccount = ((req, res) => {
    let data = req.query
    User.findOneAndUpdate({email: data.email},{$set: { status:"Active" }},{upsert: false}, function(err, doc) {
        res.redirect("http://localhost:3000/")
    });
})

const UpdateUser = catchAsync(async (req, res,next) => {
    let id = await isConnected(req, res);
    let data = req.body
    const user = await User.findById(id) //User.findOne({ _id : req.params.id})
    if(!user){
        return next(new AppError('No User found with that ID', 404))
    }
    //console.log(data)
    // Vérification mot de passe vide ou non
    if(data.password == ""){
        console.log("Success update without password");
        data = {
            "lastname" : data.lastname,
            "firstname" : data.firstname,
            "email" : data.email,
            "phone" : data.phone,
            "img": data.img,
            "birthday" : data.birthday,
            "description" : data.description
        }
    }else{
        if(data.oldPassword == user.password){
            console.log("Success")
            data = req.body
        }else{
            console.log("Error");
            return next(new AppError("Ancien mot de passe non correct", 400))
        }
    }

    const userUpdated = await User.findByIdAndUpdate(id, data,{
        new: true, //true to return the modified document rather than the original, defaults to false
        runValidators: true
    })
    hidePw(userUpdated);
    //console.log(userUpdated);
    res.status(200).json({
        status:'success',
        data:{
            userUpdated,
            id
        }
    });
})

const getLogin = catchAsync(async (req, res, next) => {
    //console.log("Fonction de connexion")
    if (req.body?.email && req.body?.pw){
        const email = req.body.email;
        const pw = req.body.pw;
        const user = await User.findOne({email: email, password: pw})
        if (!user) {
            return next(new AppError("MDP ou Email incorrect", 404)) }
        else {
            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
            res.cookie('access_token', token , {
                httpOnly: false
            })
            const eventInvitation = new Cookies(req,res).get('eventInvitation');
            if ( eventInvitation !== "" &&  eventInvitation !== undefined){
                await acceptInvitation(req, res);
            }
            hidePw(user);
            res.status(200).json({
                status:"succes",
                message:"connecté",
                token: token,
                user: user
            })
        }
    }else {
        return new AppError("Il manque le mdp ou le mail", 400);
    }

})

const getUserDeconnexion = catchAsync(async (req, res, next) => {
        let id = await isConnected(req, res);
        res.clearCookie('access_token');
        if (id !== -1){
            res.status(200).json({
                status:"success",
                message:"Vous êtes deconnecté"
            })
        }
        else {
            return next(new AppError("Connecte toi avant de vouloir te déconnecter", 401));
        }
    }
)

const deactivateAccount = catchAsync(async (req, res) => {
    // console.log("Fonction de désactivation du compte")
    let id = await isConnected(req, res);
    const user = await User.findByIdAndUpdate(id, { status:"Désactivé" }, {
        new: true, //true to return the modified document rather than the original, defaults to false
        runValidators: true
    })
    hidePw(user);
    res.status(200).json({
        status:'success',
        data:{
            user
        },
        message : "Compte désactivé"
    });
})
/* TODO Mise à jour des mots de passe
const updateForgottenPassword = catchAsync(async (res, res, next)=>{
    // Récup des données envoyées par le front
    // vérifier que l'email existe dans la bdd, si existe envoi un mail de redirection vers la page de "mot de passe oublié"
    // Vérifier que l'ancien mdp et le nouveau soit différent
    // Mise à jour bdd
})

const sendNewsLetter = catchAsync(async (res, req, next) => {
    // Récup all users mail with newsLetter = true
    // Sendmail
})

*/

module.exports = {
    createUser,
    getCurrentUser,
    getAllUsers,
    activateAccount,
    UpdateUser,
    getLogin,
    getUserDeconnexion,
    deactivateAccount,
    getUserById
}