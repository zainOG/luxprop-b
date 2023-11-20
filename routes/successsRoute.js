const express = require('express')
const router =express.Router()
const successController = require('../controllers/successController')


router.route('/')
    .post(successController.updateSession)  //READ
    

module.exports=router