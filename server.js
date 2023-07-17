const express = require('express');
const app =express()
const path= require('path')
const PORT =process.env.PORT || 3500

app.listen(PORT, ()=> console.log(`Server running on ${PORT}`))

console.log(process.env.NODE_ENV)

console.log('Im running')

app.use('/', require('./routes/scrapperRoute'))

//app.use('/', require('./routes/root'))