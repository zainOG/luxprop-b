const mongoose = require ('mongoose')

const propertiesSchema = new mongoose.Schema({
    
    propertiesData:{
        type: Object,
    },
    

},
{
    timestamps:true
}
)

module.exports = mongoose.model('Properties', propertiesSchema)