const Properties= require('../models/properties')
const asyncHandler= require('express-async-handler')
const bcrypt = require('bcrypt')
const sendEmail = require("../utils/email/sendEmail");

// @des GET ALL PROPERTIESS
// @route GET /propertiess
// @access Private

const getAllPropertiess = asyncHandler(async (req, res) => {
    const limit = 10000; // Set the limit to 200 properties per request
    const page = req.query.page || 1; // You can use query parameters to specify the page if needed
  
    const skip = (page - 1) * limit; // Calculate the number of documents to skip based on the page
  
    try {
      const propertiess = await Properties.find().skip(skip).limit(limit).lean();
    
      if (!propertiess?.length) {
        return res.status(400).json({ message: 'No propertiess found' });
      }
      console.log("Got properties")
      /* const send = propertiess.filter(property=> property.propertiesData?.source==="Bina.az")
      console.log("Filtered Properties") */
      res.json(propertiess);
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  });
  
// @des CREATE NEW PROPERTIES
// @route POST /propertiess
// @access Private

const createNewProperties = asyncHandler(async (req, res) =>{
        const{email, fullName ,propertiesname ,phone, password, role, permissions}= req.body

        //Confirm data 
        if (!email|| !password || !phone){
                return res.status(400).json({message: 'All fields are required!'})

        }

        //Check for duplicates

        const duplicates = await Properties.findOne({email}).lean().exec()

        if(duplicates){
            return res.status(409).json({message: 'Email already exists! '})
        }

        // Hash password 

        const hashedPwd = await bcrypt.hash(password, 10)

        const propertiesObject ={ email, fullName ,phone, propertiesname, "password": hashedPwd, role, permissions}

        // Create a store new properties

        const properties= await Properties.create(propertiesObject)
        if(properties){
            res.status(201).json({message: `New properties ${email} created!`})
            sendEmail(
                properties.email,
                "Account Successfully Created",
                {
                  name: properties.fullName,
                  
                },
                "./template/welcome.handlebars"
              );
        } else{
            res.status(400).json({message: 'Invaild Data used'})
        }
        
})

// @des Update PROPERTIES
// @route Patch /propertiess
// @access Private

const updateProperties = asyncHandler(async (req, res) =>{
    const {email, phone, role, password, active, permissions, propertiesname, notes}= req.body

    //Confirm Data
    if(!email){
        return res.status(400).json({message: 'Email required!'})
    }
    
    const properties = await Properties.findOne({email}).exec()
    
    if(!properties){
        return res.status(400).json({message: 'Properties not found!'})
    }
    console.log(properties)
    //Check for duplicates

    /*const duplicates= await Properties.findOne({email}).lean().exec()

    //Allow updates to the original properties
    if (duplicates){
            return res.status(409).json({message: 'Duplicate email'})
    }*/
    if(properties.email !== email){
        properties.email = email
    }
    if(role){
        properties.role= role
    }
    if (phone){
        properties.phone=phone
    }
    if (propertiesname){
        properties.propertiesname=propertiesname
    }

    if(active||active!=undefined){
        properties.active=active
    }
    if(password){
        //Hash Password
        properties.password = await bcrypt.hash(password, 10)
    }
    if(permissions){
        //Hash Password
        properties.permissions = permissions
    }
    if(notes){
        properties.notes= notes
    }
    const updatedProperties= await properties.save()
    
    console.log(updatedProperties)

    res.json({message: `${updatedProperties.email} updated!`})
    
})

// @des delete PROPERTIES
// @route delete /propertiess
// @access Private

const deleteProperties = asyncHandler(async (req, res) =>{
    const {_id, active}= req.body
    if(!_id){
        return res.status(400).json({message: 'ID Required'})

    }
    console.log(_id, active)
    /*const note= await Note.findOne({email}).lean().exec()

    if(note){
        return res.status(400).json({message: 'Properties has assigned tasks'})
    }*/
    const properties = await Properties.findById(_id).exec()

    if(!properties){
        return res.status(400).json({message: 'Properties not found'})

    }
    let result
    if(!active&&active===undefined){
        result = await properties.deleteOne()
    }
    if(active===true){
        properties.active= false
        result = await Properties.findByIdAndUpdate(properties._id, properties)
    }
    if(active===false){
        properties.active= true
        result = await Properties.findByIdAndUpdate(properties._id, properties)
    }
    console.log(result)

    const reply = `Email ${result.email} with ID ${result._id} deleted!`

    res.json(reply)
})


module.exports={
    getAllPropertiess,
    createNewProperties,
    updateProperties,
    deleteProperties
}