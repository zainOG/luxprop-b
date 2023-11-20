const User= require('../models/User')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Session = require('../models/session')
const sendEmail = require("../utils/email/sendEmail");
const asyncHandler= require('express-async-handler')

const updateUser = async(session) =>{
    const sessionId = session.sessionData.id;

        try {
          const session = await stripe.checkout.sessions.retrieve(sessionId);
          const customerEmail = session.customer_email;
          const user = await User.findOne({email: customerEmail}).exec()
          if (session.payment_status === 'paid') {
            console.log('Payment was successful!');
            user.active = true
            sendEmail(
                customerEmail,
                "Important: Payment Successfull",
                {
                  name: user.fullName,
                  
                },
                "./template/paymentDone.handlebars"
              );
          } else if (session.payment_status === 'unpaid') {
            console.log('Payment was not successful.');
            sendEmail(
                customerEmail,
                "Important: Payment Failed",
                {
                  name: user.fullName,
                  
                },
                "./template/paymentFailed.handlebars"
              );
          } else {
            console.log('Payment status:', session.payment_status);
            // Additional handling for other payment statuses
          }
          sendEmail(
            customerEmail,
            "Important: Payment Successfull",
            {
              name: user.fullName,
              
            },
            "./template/welcome.handlebars"
          );
          const updatedUser= await user.save()
          if(updatedUser){
            console.log("User Updated!")
          }
        } catch (error) {
          console.error('Error retrieving Checkout Session:', error.message);
        }
}

const updateSession = asyncHandler(async (req, res) =>{
    
    const sessions = await Session.find().lean()
    console.log(sessions)
    sessions.map((session)=>{
        updateUser(session)
    })

 

})
module.exports={
    updateSession
}