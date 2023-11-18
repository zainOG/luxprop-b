const User = require('../models/User')
const userControllers = require('./userController')
const bcrypt = require('bcrypt')
const jwt = require ('jsonwebtoken')
const asyncHandler = require('express-async-handler')

// @ route POST /auth
// @ access public
const login = asyncHandler( async(req, res) => {
    const{ username, password, email } = req.body
    console.log(req.body)
    const timestamp = Date.now()
    if(!email||!password){
        return res.status(400).json({ message: 'All fields are required'})
    }
    let foundUser
    if (email && email.includes('@')) {
        foundUser = await User.findOne({email}).lean().exec()
    } else {
       const username = email
        foundUser = await User.findOne({username}).lean().exec()
    }
   
    
    if(!foundUser){
        return res.status(401).json({ message: 'Not Registered!' })

    }
    
    
    if(foundUser){
        if(!foundUser.active)
            return res.status(401).json({ message: 'Unauthorized' })

        const match = await bcrypt.compare(password, foundUser.password)

        if(!match) 
            return res.status(402).json({message: 'Incorrect Password'})
        
        const accessToken = jwt.sign(
            {
                "UserInfo":{
                    "email": foundUser.email,
                    "fullName": foundUser.fullName,
                    "role": foundUser.role,
                    
                    "active": foundUser.active,
                    
                }
            
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '5m'}
        )
    
        const refershToken = jwt.sign(
            {"email": foundUser.email,
            "tasks": foundUser.tasks, 
        },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '2hr'}
        )
    
        res.cookie('jwt', refershToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'None', //cross-site cookie
            maxAge: 7 * 24 * 60 * 60 * 1000 //cookie expiry: set to match rT
        })
        
        res.json({ accessToken, Name: foundUser.fullName, Role: foundUser.role, lastLogin: foundUser.lastLogin })
    }
    if(foundUser){
        foundUser.lastLogin= timestamp
        const updatedUser= await User.findByIdAndUpdate(foundUser._id, foundUser)
        console.log("time updated!")

    }

})

// @ route POST /auth/sigup
// @ access public
const signup =(req, res) =>{
   userControllers.createNewUser(req, res)
}


// @ route Get /auth/refersh
// @ access public
const refresh =(req, res) =>{
    const cookies = req.cookies

    if (!cookies?.jwt) return res.status(401).json({ message: 'Unauthorized'})

    const refershToken= cookies.jwt

    jwt.verify(
        refershToken,
        process.env.REFRESH_TOKEN_SECRET,
        asyncHandler(async (err, decoded) =>{
            if (err) return res.status(403).json({ message: 'Forbidden' })

            const foundUser = await User.findOne({ email: decoded.email})

            if (!foundUser) return res.status(401).json({ message: 'Unauthorized'})

            if(foundUser){
                const accessToken = jwt.sign(
                    {
                        "UserInfo":{
                            "email": foundUser.email,
                            "fullName": foundUser.fullName,
                            "role": foundUser.role
                        }
                    },
                    process.env.ACCESS_TOKEN_SECRET,
                    { expiresIn: '60m'}
                )
    
                res.json({ accessToken })
            }
            
        })
    )
}


//@ route /auth/logout
//@ access Public
const logout = (req, res) => {
    const cookies = req.cookies
    if(!cookies?.jwt) return res.sendStatus(204)
    res.clearCookie('jwt', { httpOnly: true, sameSite:'None', secure: true })
    res.json({ message: 'Cookie cleared' })

}

module.exports ={
    login,
    signup,
    refresh,
    logout,
}
