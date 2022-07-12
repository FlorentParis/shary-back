const express = require('express')
const router = express.Router()

const {
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

} = require('../controllers/ModulesController.js')

router.post('/createModules', createModules)
router.post('/deleteModules', deleteModules)
router.post('/statusPhotosVideos', statusPhotosVideos)
router.post('/updateModules', updateModules)
router.post('/uploadsModule', uploadsModule)

router.get('/getAllModules', getAllModules)
router.get('/getModulesByEventId', getModulesByEventId)
router.get('/getModuleByEventId', getModuleByEventId)
router.get('/getAllPhotosVideos', getAllPhotosVideos)
router.get('/getAllPhotosVideosByStatus', getAllPhotosVideosByStatus)


module.exports = router