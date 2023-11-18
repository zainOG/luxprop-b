const express = require('express')
const router =express.Router()
const propertiesController = require('../controllers/propertiesController')


router.route('/')
    .get(propertiesController.getAllPropertiess)  //READ
    .post(propertiesController.createNewProperties) //CREATE
    .patch(propertiesController.updateProperties) //UPDATE
    .delete(propertiesController.deleteProperties) //DELETE

module.exports=router