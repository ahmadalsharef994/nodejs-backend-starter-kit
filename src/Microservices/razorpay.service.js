const axios = require('axios');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');

var razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const calculateSHADigest = async(reqBody) => {
    const secret = process.env.RAZORPAY_UAT_SECRET

    const shasum = crypto.createHmac("sha256", secret);
    shasum.update(JSON.stringify(reqBody));
    const digest = shasum.digest("hex");

    console.log("calculatedSHADigest: ", digest)
    return digest
}

const createRazorpayOrder = async(amount, currency) => {
    const options = {
        amount,
        currency,
        receipt: shortid.generate(),
      };
    
      try {
        const response = await razorpay.orders.create(options);
        console.log("razorpayResponse: ", response); // response shown
        return response
      } catch (err) {
        throw new ApiError(httpStatus.NOT_FOUND)
      }
}
module.exports = {
    calculateSHADigest,
    createRazorpayOrder
}