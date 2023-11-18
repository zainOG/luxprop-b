require('dotenv').config()
const express = require('express');
const app =express()
const path= require('path')
const { logger } = require('./middleware/logger')
const errorHandler = require('./middleware/errorHandler')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const corsOptions = require ('./config/coresOptions')
const connectDB = require('./config/DBConn')
const mongoose = require('mongoose')
const {logEvents}= require('./middleware/logger')
const bodyParser = require('body-parser');
const PORT =process.env.PORT || 3500

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

app.use(logger)

connectDB()

app.use(logger)

app.use(cors(corsOptions))

app.use(express.json())

app.use(cookieParser())

console.log(process.env.NODE_ENV)

app.use('/', express.static(path.join(__dirname,'public')))

app.use('/', require('./routes/root'))

app.use('/api/v1/scrape', require('./routes/scrapperRoute'))

app.use('/api/v1/users', require('./routes/userRoutes'))

app.use('/api/v1/properties', require('./routes/propertiesRoute'))

app.use('/api/v1/auth', require('./routes/authRoutes'))

app.use('/api/v1/resetPassword', require('./routes/resetPassword'))

app.use(errorHandler)

app.all('*', (req, res)=>{
    res.status(404)
    if(req.accepts('html')){
        res.sendFile(path.join(__dirname, 'views', '404.html'))
    }
    else if(req.accepts('json')){
        res.json({message: '404 Not Found!'})
    }
    else{
        res.type('text').send('404 Not found')
    }
})


mongoose.connection.once('open', () =>{
    console.log('Connected to MongoDB')
    app.listen(PORT, ()=> console.log(`Server running on ${PORT}`))
})

mongoose.connection.on('error', err =>{
    console.log(err)
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'MongoErrLog.log')
})