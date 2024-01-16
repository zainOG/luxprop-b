const axios = require('axios');

const sendSMS = ( async(destination, message) =>{


    const url = `https://${process.env.INFOBIPURL}/sms/2/text/advanced`;
    const headers = {
      'Authorization': `App ${process.env.INFOBIPKEY}`,
      'Content-Type': 'application/json',
    };
    const data = {
      'messages': [
        {
          'from': "ServiceSMS",
          'destinations': [
            {
              'to': destination,
            },
          ],
          'text': message,
        },
      ],
    };

  return axios.post(url, data, { headers })
    .then((response) => {
      console.log(response.data);
    })
    .catch((error) => {
      console.error(error);
    });

})

module.exports = {
    sendSMS
}
