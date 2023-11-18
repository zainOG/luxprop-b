const express = require('express')
const router =express.Router()
const userController = require('../controllers/userController')


router.route('/')
    .get(userController.getAllUsers)  //READ
    .post(userController.createNewUser) //CREATE
    .patch(userController.updateUser) //UPDATE
    .delete(userController.deleteUser) //DELETE

module.exports=router