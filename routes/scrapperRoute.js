const express = require('express')
const router =express.Router()
const { scrapeSite } = require('../controllers/scrapper')
const path =require('path')

router.get('^/$|/index(.html)?', (req, res) => {
   scrapeSite(req, res)
   res.sendFile(path.join(__dirname, '..','views', 'index.html'))
})  

module.exports = router