const Event = require('../models/Event.js');
const User = require('../models/User.js');
var Cookies = require( "cookies" )
var nodemailer = require('nodemailer');
const catchAsync = require('../utils/catchAsync');
const e = require('express');
require('dotenv').config();
const { isConnected } = require('../utils/isConnected')
const { acceptInvitation } = require('../utils/acceptInvitation')
const AppError = require("../utils/appError");

const createEvent = catchAsync(async(req, res) => {
    var data = req.body
    let contact = {}
    let contact2 = {}
    let contacts = {}
    if(data.contactName !== "" && data.contactPhone !== "") {
        //console.log("Contact 1 créé")
        contact = {
            "0": {
                "name": data.contactName,
                "phone": data.contactPhone,
                "appel": data.contactCall,
                "sms": data.contactText
            }
        }
    }
    if(data.contactNameSec !== "" && data.contactPhoneSec !== "") {
        //console.log("Contact créé 2")
        contact2 = {
            "1": {
                "name": data.contactNameSec,
                "phone": data.contactPhoneSec,
                "appel": data.contactCallSec,
                "sms": data.contactTextSec
            }
        }
    }
    console.log(data.start)
    console.log(data.eventStartHour)
    data.start = new Date(data.start + " " + data.eventStartHour)
    data.end = new Date(data.end + " " + data.eventEndHour)
    data.alertDate = new Date(data.alertDate + " " + data.alertHour)

    contacts = Object.assign({}, contact, contact2)
    console.log("Contacts : ", contacts)

    let eventInfo = {}
    eventInfo = {
        "userId" : data.userId,
        "name" : data.name,
        "type" : data.type,
        "description" : data.description,
        "banniere" : data.img,
        "start" : data.start,
        "end" : data.end,
        "dresscode" : data.dresscode,
        "place" : {
            "address" : data.address,
            "zipcode" : data.zipcode,
            "city" : data.city,
            "access" : {
                "train" : data.train,
                "parking" : data.car,
                "autres" : data.autre,
                "precision" : data.precision
            }
        },
        "contacts" : contacts,
        "notifications" : {
            "inviteAccepted" : data.inviteAccepted,
            "inviteRefused" : data.inviteRefused,
            "announcement" : data.newClaim
        },
        "alerts" : {
            "date" : data.alertDate,
            "description" : data.alertDescription
        },
        "participants" : {},
        "modules" : {
            "photos_videos" : false,
            "chat" : false,
            "livre_d_or" : false,
            "articifice" : false,
            "fresque" : false,
            "playlist" : false
        }
    }
    const event = await Event.create(eventInfo)
    console.log(event)
    return res.status(200).json({
        status: 'success',
        data: {
            event
        },
        message : ""
    })
})

const getAllEvents = catchAsync(async(req, res) => {
    data = req.query
    let events = await Event.find(data)
    res.status(200).json({
        status: 'success',
        data: {
            events
        },
        message : ""
    })
})

const getAllEventsByCreator = catchAsync(async(req, res) => {
    let data = req.query
    let events = await Event.find({})
    let userEvent = []

    events.forEach(function(event){
        if(event.userId == data._id){
            return userEvent.push(event)
        }
    });

    res.status(200).json({
        status: 'success',
        data: {
            userEvent
        },
        message : "Récuperation des évènements creer par l'utilisateur :" + data._id
    })
})

const getAllEventsByParticipant = catchAsync(async(req, res) => {
    let data = req.query

    let events = await Event.find({})
    let userEvent = []
    events.forEach(event =>
        event.participants.forEach(function(participant){
            if(participant.userId == data._id && participant.status == "Accepted"){
                return userEvent.push(event)
            }
        })
    );

    res.status(200).json({
        status: 'success',
        data: {
            userEvent
        },
        message : "Récuperation des évènements l'utilisateur " + data._id + " est participant"
    })
})

const getAllEventsByUser = catchAsync(async(req, res) => {
    let data = req.query
    let events = await Event.find({})
    let userEvent = []

    events.forEach(function(event){
        if(event.userId == data._id){
            userEvent.push(event)
            event = undefined
        }
    });

    events.forEach(event =>
        event.participants.forEach(function(participant){
            if(participant.userId == data._id && participant.status == "Accepted"){
                userEvent.push(event)
                event = undefined
            }
        })
    );
    console.log(userEvent)
    let uniqueArray = [...new Map(userEvent.map(item => [item._id, item])).values()]
    userEvent = uniqueArray;
    

    res.status(200).json({
        status: 'success',
        data: {
            userEvent
        },
        message : "Récuperation des évènements creer par l'utilisateur :" + data._id
    })
})

const getEventsByStatus = catchAsync(async(req, res) => {
    data = req.query

    /* Récupération de des évènements grace au status */
    let events = await Event.find({status : data.status})

    res.status(200).json({
        status: 'success',
        data: {
            events
        },
        message : "Récuperation des évènements ayant pour status : " + data.status
    })

})

const updateEvent = catchAsync(async(req, res) => {
    const data = req.body
    console.log(data._id)

    let contact = {}
    let contact2 = {}
    let contacts = {}

    //console.log("Contact 1 créé")
    contact = {
        "0": {
            "name": data.contactName,
            "phone": data.contactPhone,
            "appel": data.contactCall,
            "sms": data.contactText
        }
    }
    
    //console.log("Contact créé 2")
    contact2 = {
        "1": {
            "name": data.contactNameSec,
            "phone": data.contactPhoneSec,
            "appel": data.contactCallSec,
            "sms": data.contactTextSec
        }
    }

    data.start = new Date(data.start + " " + data.eventStartHour)
    data.end = new Date(data.end + " " + data.eventEndHour)
    data.alertDate = new Date(data.alertDate + " " + data.alertHour)

    contacts = Object.assign({}, contact, contact2)
    console.log("Contacts : ", contacts)
    

    let eventInfo = {}
    eventInfo = {
        "userId" : data.userId,
        "name" : data.name,
        "type" : data.type,
        "description" : data.description,
        "banniere" : data.img,
        "start" : data.start,
        "end" : data.end,
        "dresscode" : data.dresscode,
        "place" : {
            "address" : data.address,
            "zipcode" : data.zipcode,
            "city" : data.city,
            "access" : {
                "train" : data.train,
                "parking" : data.car,
                "autres" : data.autre,
                "precision" : data.precision
            }
        },
        "contacts" : contacts,
        "notifications" : {
            "inviteAccepted" : data.inviteAccepted,
            "inviteRefused" : data.inviteRefused,
            "announcement" : data.newClaim
        },
        "alerts" : {
            "date" : data.alertDate,
            "description" : data.alertDescription
        },
        "participants" : {},
        "modules" : {
            "photos_videos" : false,
            "chat" : false,
            "livre_d_or" : false,
            "articifice" : false,
            "fresque" : false,
            "playlist" : false
        }
    }
    let event = await Event.findByIdAndUpdate(data._id, eventInfo,{
        new: true, //true to return the modified document rather than the original, defaults to false
        runValidators: true
    })
    console.log(event)

    res.status(200).json({
        status: 'success',
        data: {
            event
        },
        message : "L'event a bien été modifié !"
    })
})

const addParticipant = catchAsync(async(req, res, next) => {

    var data = req.body

    let event = await Event.find(
        {
            _id: data.idEvent,
        }
    )

    if (!event)
        return res.status(500).send("Event not found")


    let userInfo = await User.find({
        email: data.email
    })

    let userInfoObject = {}

    if(userInfo.length !== 0){
        userInfoObject = {
            userId: userInfo[0]._id,
            email: userInfo[0].email,
            role: "user"
        }
    }else{
        userInfoObject = {
            email: data.email,
            role: "user"
        }
    }

    if(!event[0].participants){
        event[0].participants = {
            "0": userInfoObject
        }
        const result = await Event.replaceOne({_id: event[0]._id},event[0])
        let mailSent = await sendMail(userInfoObject,event[0])
        res.status(200).json({
            status: 'success',
            data: {
                result,
                userInfoObject
            },
            message : "Une personne a été ajouté a la liste des participants"
        })

    } else {
        let count = event[0].participants.size
        object = {}
        string = 'participants.' + count
        object['participants.'+count] = userInfoObject
        const result = await Event.update({ _id: data.idEvent}, { "$set": object })
        let mailSent = await sendMail(userInfoObject,event[0])
        console.log(mailSent)
        res.status(200).json({
            status: 'success',
            data: {
                result,
                userInfoObject
            },
            message : "Une personne a été ajouté a la liste des participants"
        })
    }
})

const getParticipantsByEvent = catchAsync(async(req, res) => {
    data = req.query

    /* Récupération de l'évènement grace a l'id_event */
    let events = await Event.findById(data._id)

    /* Récupération des participants de l'évènement */
    let participants = events.participants
    let list_participant = []
    let user_info = {}
    for (const participant of participants) {
        console.log(participant)
        let id = participant[1].userId
        console.log("Function Get participants Event ", id)
        if(id){
            id = id.toString()
            console.log("Participant a un compte", id)
            let user = await User.findById(id)
            console.log("TEST", user)
            user_info = {
                "email" : participant[1].email,
                "role" : participant[1].role,
                "status_invit" : participant[1].status ,
                "img" : user.img,
                "lastname": user.lastname,
                "firstname" : user.firstname,
                "status_account" : user.status
            }
        }else{
            console.log("Participant n'a pas de compte")

            user_info = {
                "email" : participant[1].email,
                "role" : participant[1].role,
                "status_invit" : participant[1].status ,
                "img" : "https://res.cloudinary.com/dr7db2zsv/image/upload/v1657014631/ij8qgts5uouifonqjj6w.png",
                "lastname": "",
                "firstname" : "",
                "status_account" : "Pas de compte"
            }
        }
        list_participant.push(user_info)
    }
    console.log(list_participant)

    res.status(200).json({
        status: 'success',
        data: {
            list_participant
        },
        message : "Récuperation information des participants de l'évènement " + data._id
    })
})

const getModuleStatusByEvent = catchAsync(async(req, res) => {
    data = req.query

    /* Récupération de l'évènement grace a l'id_event */
    let events = await Event.findById(data._id)

    /* Récupération des participants de l'évènement */
    let modules = events.modules
    res.status(200).json({
        status: 'success',
        id_event : data._id,
        test : modules.photoVideo,
        data : {
            modules
        },
        //message : "Récuperation des modules de l'évènement " + data._id
    })
})

const updateModuleStatus = catchAsync(async (req, res)=>{
    let data = req.body;
    // Get modules of the event and change the value of one element of the array "modules"
    const event = await Event.findById( data.idEvent )
    event.modules[req.body.nameModule] = req.body.value
    const event_updated = await Event.findByIdAndUpdate(data.idEvent, event)
    // Send result json if success else catch error with catch Async and send error name
    res.status(200).json({
            status: 'success',
            data: {
                event_updated
            }
        }
    );
})

const sendMail = async(userInfo,event) =>{
    console.log("sendMail invitation")
    const userEvent = await User.find({
        _id: event.userId,
    })
    const subject = "Invation à l'évènement de " + userEvent[0].firstname + " " + userEvent[0].lastname
    const html = "<a href='https://fathomless-forest-78481.herokuapp.com/api/event/cookieInvitation/?eventId=" + event._id + "'>Accepter l'invitation</a>"
    if(userInfo.email){
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: "OAuth2",
                user: "symchowiczbenji@gmail.com",
                clientId: "828571010780-5qkqqvb2d0ensbl7qqtq8scsi967r6cc.apps.googleusercontent.com",
                clientSecret: process.env.GOOGLE_OAUTH2_KEYS,
                refreshToken: "1//04Xq2X3b-NsYbCgYIARAAGAQSNwF-L9IrYZkIO6cNd8ERMuWJJArLPXplJM7xv-0s4Z2Z-vGV2zih2VGU2Dlq0hrHjC7E1iKQ41M"
            }
        });
        var message = {
            from: "symchowiczbenji@gmail.com", // sender address
            to: userInfo.email, // list of receivers
            subject: subject, // Subject line
            text: "data.contenu", // plaintext body
            html:html
        }
        return await transporter.sendMail(message);
    }
}

const cookieInvitation = catchAsync(async(req, res, next) => {
    console.log("Function cookie Invitation")
    const data = req.query
    await res.cookie('eventInvitation', data.eventId, {
        httpOnly: true
    })
    const result = await acceptInvitation(req, res, data.eventId);
    if(result === 401){
        return next(new AppError("Veuillez vous connectez avant d'accepter l'invitation", 401))
    }
    res.redirect("https://shary.netlify.app/")
})

const deleteEvent = catchAsync(async(req, res) => {
    data = req.query
    let result = await Event.deleteOne(
        {_id:data.eventId}
    )
    res.status(200).json({
            status: 'success',
            data: {
                result
            },
            message : "L'event ayant pour iD" + data.eventId + "a été supprimé"
        }
    );

})


module.exports = {
    createEvent,
    updateEvent,
    deleteEvent,
    getAllEvents,
    getAllEventsByCreator,
    getAllEventsByParticipant,
    getEventsByStatus,
    addParticipant,
    getParticipantsByEvent,
    getModuleStatusByEvent,
    updateModuleStatus,
    cookieInvitation,
    getAllEventsByUser
}