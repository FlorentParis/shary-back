const Modules = require('../models/Modules.js')
const nodemailer = require('nodemailer');
const { cloudinary } = require('../utils/cloudinary');
require('dotenv').config()
const { json } = require('body-parser');
const bcrypt = require('bcrypt')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError');


const createModules = catchAsync(async(req, res, next) => {
    let data = req.body;
    //Take datas we want only
    const newModules = await Modules.create(data);

    console.log(data)

    // Send result json if success else catch error with catch Async and send error name
    res.status(200).json({
            status: 'success',
            data: {
                newModules
            },
            message : "Event module created."
        }
    );

})

const getModuleByEventId = catchAsync(async(req, res, next) => {
    let data = req.query;
    let nomModule = data.nameModule;

    const myModule = await Modules.findOne( {id_event:data.idEvent} ).select(nomModule);

    console.log(myModule)

    // Send result json if success else catch error with catch Async and send error name
    res.status(200).json({
            status: 'success',
            data: {
                myModule
            }
        }
    );

})

const deleteModules = catchAsync(async(req, res) => {
    data = req.body
    let result = await Modules.deleteOne(
        {id_event:data.id_event}
    )
    res.status(200).json({
        status: 'success',
        data: {
            result
        },
        message : "Les modules ayant pour iDevent " + data.id_event + "ont été supprimés"
    })
})

const updateModules = catchAsync(async(req, res) => {


    data = req.body
    console.log(data);
    /* Recuperation des modules grace a l'id_event */
    let modules = await Modules.findOne(
        {id_event:data.id_event}
    )

    console.log("--------------------------------------")

    console.log(modules);

    console.log("--------------------------------------")
    
    /* Modifications des modules en fonction de la data recuperée */
    for (const key of Object.keys(data)) {
        console.log(key);
        if(key != "id_event")
            if(modules[key] != data[key] && typeof(data[key]) != "undefined"){
                modules[key] = data[key]
            }
    }

    console.log(modules);

    /* Remplacement des modules par les nouveaux */
    const result = await Modules.replaceOne({id_event:data.id_event},modules)

    res.status(200).json({
        status: 'success',
        data: {
            result
        },
        message : "Les modules ayant pour iDevent " + data.id_event + "ont été modifiés"
    })
})

const getAllModules = catchAsync(async(req, res) => {
    data = req.query
    console.log(data)
    let modules = await Modules.find(data)
    res.status(200).json({
        status : 'success', 
        data: {
            modules
        },
        message: "voici tout les modules"
    })
})

const getModulesByEventId = catchAsync(async(req, res) => {
    data = req.query
    console.log(data)
    let modules = await Modules.find(data)
    let eventModules = []
    modules.forEach(modules => function(){
            if(module.id_event == data.id_event){
                return eventModules.push(modules)
            }
    })
    res.status(200).json({
        status: 'success', 
        data: {
            eventModules
        },
        message : "voici tout les modules dans l'event ayant x pour ID"
    })
})

const uploadsModule = catchAsync(async(req, res) => {
    const data = req.body
    let modules = await Modules.findOne({id_event:data.event})
    console.log(modules)
    if(modules != null){
        let count
    
        switch (data.module) {

            case 'photos_videos':
                if(data.file){
                    /* const fileStr = data.file;
                    const uploadResponse = await cloudinary.uploader.upload(fileStr, {upload_preset: 'modules',}); */
 
                    count = modules.photos_videos.medias.size
                    
                    console.log(count)
                    let infosPhotosVideos = {}
                    
                    infosPhotosVideos['photos_videos.medias.media'+count] = {
                            content : data.file,
                            id_author : data.author
                    }
                    console.log(infosPhotosVideos)
                
                    const result = await Modules.updateOne({ id_event: data.event}, { "$set": infosPhotosVideos })
                    
                    console.log(result)
        
                    return res.status(200).json({
                        status: 'success',
                        data: {
                            result
                        },
                        message : "upload reussi module photos_videos , url du fichier : " + data.file
                    })
                }else{
                    err = "Pas de photo ou video dans le body"
                    return res.status(500).json({
                        status: 'error',
                        data: {
                            err
                        },
                        message : "Rien n'a été upload"
                    })
                }
     
            case 'livre_d_or': 
                console.log("test")
                count = modules.livre_d_or.messages.size
                let infosChat = {}            
                infosChat['livre_d_or.messages.message'+count] = {
                        content : { 
                            message: data.message,
                            typographie : data.typographie,
                            style : data.style,
                            couleurs : data.couleurs
                        },
                        id_author : data.author
                }
                
                const result = await Modules.updateOne({ id_event: data.event}, { "$set": infosChat })
                
                console.log(result)
    
                return res.status(200).json({
                    status: 'success',
                    data: {
                        result
                    },
                    message : "upload reussi module photos_videos , url du fichier : " + data.file
                })

            case 'chat':

                result = "On utilisera plutot socket.io pour upload des messages :)"

                /* count = modules.chat.messages.size
                                
                let infosMessage = {}
            
                infosMessage['chat.messages.message'+count] = {
                    content : data.message,
                    id_author : data.author
                }
                console.log(infosMessage)
            
                result = await Modules.updateOne({ id_event: data.event}, { "$set": infosMessage })
                
                console.log(result) */
    
                return res.status(200).json({
                    status: 'success',
                    data: {
                        result
                    },
                    message : result
                })

            default:
              console.log('le module ' + data.module + " n'existe pas");
        }
    }else{
        err = "Pas de variable event dans le body, ou alors celui ci ne correspond a aucun id_event de la collection modules"
        return res.status(500).json({
            status: 'error',
            data: {
                err
            },
            message : "Rien n'a été upload"
        })
    }
      

})

const statusPhotosVideos = catchAsync(async(req, res) => {
    const data = req.body

    let modules = await Modules.findOne({id_event:data.event})

    modules.photos_videos.medias.forEach(media => {
        if(media.content == data.content){
            media.status = data.status
            console.log(media)
        }
    })

    let result = await Modules.replaceOne({id_event:data.event}, modules)

    return res.status(200).json({
        status: 'success',
        data: {
            result
        },
        message : "La photo (ou video) " + data.content + " est blacklistée"
    })
     
})

const getAllPhotosVideos = catchAsync(async(req, res) =>  {

    data = req.query

    let modules = await Modules.findOne({id_event:data.event})
    let medias = modules.photos_videos.medias
    return res.status(200).json({
        status: 'success',
        data: {
            medias
        },
        message : "Les photos/videos de l'event " + data.event + " ont été renvoyées"
    })

})

const getAllPhotosVideosByStatus = catchAsync(async(req, res) =>  {

    data = req.query

    let modules = await Modules.findOne({id_event:data.event})
    let arrayMediasByStatus = []
    modules.photos_videos.medias.forEach(media => {
        if(media.status == data.status){
            arrayMediasByStatus.push(media)
        }
    })

    return res.status(200).json({
        status: 'success',
        data: {
            arrayMediasByStatus
        },
        message : "Les photos/videos de l'event " + data.event + " ayant pour status" + data.status + " ont été renvoyées"
    })

})

module.exports = {
    createModules,
    deleteModules,
    getAllModules,
    getModulesByEventId,
    updateModules,
    uploadsModule,
    statusPhotosVideos,
    getAllPhotosVideos,
    getAllPhotosVideosByStatus,
    getModuleByEventId
}