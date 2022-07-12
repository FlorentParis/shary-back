var Cookies = require( "cookies" )
const { isConnected } = require('../utils/isConnected')
const Event = require('../models/Event.js');
const User = require('../models/User.js');
const AppError = require("./appError");

async function acceptInvitation(req, res, eventId = null){ 
    const idUser = await isConnected(req,res);
    if(idUser === "Not connected"){
        return 401;
    }
    if(eventId === null) {
        var eventInvitation = new Cookies(req,res).get('eventInvitation');
    }
    else {
        eventInvitation = eventId;
    }
    console.log(eventInvitation, "eventInvitation");
    var result;
    if (idUser && eventInvitation !== "") {
        const event = await Event.findOne({_id : eventInvitation})
        const user = await User.findById(idUser)
        event.participants.forEach(function(participant){
            if(participant.email == user.email){
                participant.userId = idUser;
                participant.status = "Accepted";
            }
        });
        result = await Event.replaceOne({_id: eventInvitation},event)
        res.clearCookie('eventInvitation');
    }
    return result;
}

module.exports = {
    acceptInvitation
}