const express = require('express')
const router = express.Router()
const { isConnected } = require('../utils/isConnected')

const  {
    createUser,
    getAllUsers,
    activateAccount,
    getCurrentUser,
    UpdateUser,
    getLogin,
    getUserDeconnexion,
    deactivateAccount,
    getUserById
} = require('../controllers/UserController.js')
const { nextTick } = require('process')


router.post('/createUser', createUser),
router.patch('/modifyUserInfo',isConnected, UpdateUser),
router.get('/emailVerification', activateAccount),
router.get('/',isConnected, getAllUsers),
router.post('/getUserConnexion', getLogin),
router.post('/getUserDeconnexion', getUserDeconnexion),
router.get('/getMyInfo',isConnected, getCurrentUser),
router.get('/DeactivateUser', isConnected, deactivateAccount)
router.get('/getUserById', getUserById)
module.exports = router