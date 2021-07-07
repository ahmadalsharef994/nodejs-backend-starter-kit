const axios = require("axios");
const otpGenerator = require('otp-generator')

const tlClient = axios.create({
  baseURL: "https://api.textlocal.in/",
  params: {
    apiKey: "YOUR API KEY", //Text local api key
    sender: "6 CHARACTER SENDER ID"
  }
});

const smsClient =  {
  
    sendVerificationMessage: user => {
      
        if (user && user.phone) {
          const params = new URLSearchParams();
          const verifycode = otpGenerator.generate(6, { upperCase: false, specialChars: false });
          params.append("numbers", [parseInt("91" + user.phone)]);
          params.append(
            "message",
            `Your iWheels verification code is` + verifycode 
          );
          tlClient.post("/send", params);
        }
      }
    };
    
module.exports = {
    smsClient
        
        
};
      
           