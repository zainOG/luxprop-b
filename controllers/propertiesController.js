const Properties= require('../models/properties')
const asyncHandler= require('express-async-handler')
const bcrypt = require('bcrypt')
const sendEmail = require("../utils/email/sendEmail");

// @des GET ALL PROPERTIESS
// @route GET /propertiess
// @access Private
const axios = require('axios');

const getAllPropertiess = asyncHandler(async (req, res) => {
  const limit = 15000;
  const page = req.query.page || 1;

  const skip = (page - 1) * limit;

  try {
    const properties = await Properties.find().skip(skip).limit(limit).lean();

    if (!properties?.length) {
      return res.status(400).json({ message: 'No properties found' });
    }

    // Filter properties with valid imageURL
   /*  const validProperties = await Promise.all(
      properties.map(async (property) => {
        if (property?.propertiesData?.imageURL) {
          try {
            const response = await axios.head(property.propertiesData.imageURL);
            
            if (response.status === 200) {
              console.log("Image is valid.");
              return property;
            } else {
              console.log("Image is not valid or cannot be loaded.");
              return null;
            }
          } catch (error) {
            console.error("Error checking image validity:", error.message);
            return null;
          }
        }
      })
    ); */

    /* const filteredProperties = validProperties.filter(Boolean); */

    /* if (!filteredProperties?.length) {
      return res.status(400).json({ message: 'No properties with valid images found' });
    } */

    console.log("Got properties:", " Sending: ", properties.length);
    res.json(properties);
  } catch (error) {
    console.error(error);
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
    const {source}= req.body
    if(!source){
        return res.status(400).json({message: 'ID Required'})

    }
    console.log(source)
   
    const properties = await Properties.find().lean()
    if(!properties){
        return res.status(400).json({message: 'Properties not found'})

    }
    console.log("Total: ",properties.length)
    const propertiesToDelete = properties.filter((property)=> {
        if(!property.propertiesData){
            if(property.propertiesData.source === source){
                return property;
            }
        }
    })
    console.log("Deleting", propertiesToDelete.length)

    
    
    if(!propertiesToDelete){
        return res.status(400).json({message: 'No Properties to delete'})

    }
    
    const propertyIdsToDelete = propertiesToDelete.map((property) => property._id);
    
    await Properties.deleteMany({ _id: { $in: propertyIdsToDelete } });
   

    const reply = `All deleted!`

    res.json(reply)
})


module.exports={
    getAllPropertiess,
    createNewProperties,
    updateProperties,
    deleteProperties
}