const crypto = require('crypto');
const Razorpay = require('razorpay');
const short = require('short-uuid');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const calculateSHADigest = async (reqBody) => {
  const secret = process.env.RAZORPAY_UAT_SECRET;

  const shasum = crypto.createHmac('sha256', secret);
  shasum.update(JSON.stringify(reqBody));
  const digest = shasum.digest('hex');

  // console.log('calculatedSHADigest: ', digest);
  return digest;
};

const createRazorpayOrder = async (amount, currency) => {
  const options = {
    amount,
    currency,
    receipt: short.generate(),
  };

  try {
    const response = await razorpay.orders.create(options);
    // console.log('razorpayResponse: ', response); // response shown
    return response;
  } catch (err) {
    throw new ApiError(httpStatus.NOT_FOUND);
  }
};

module.exports = {
  calculateSHADigest,
  createRazorpayOrder,
};

/*
const express = require("express");
const path = require("path");
const Razorpay = require("razorpay");
const shortid = require("shortid");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const cors = require("cors");

require("dotenv").config();

const app = express();

app.use(cors());
app.use(bodyParser.json());

var razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

app.get("/logo.svg", (req, res) => {
  res.sendFile(path.join(__dirname, "logo.svg"));
});

app.post("/verification", (req, res) => {
  const secret = "razorpaysecret";

  console.log(req.body);

  const shasum = crypto.createHmac("sha256", secret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest("hex");

  console.log(digest, req.headers["x-razorpay-signature"]);

  if (digest === req.headers["x-razorpay-signature"]) {
    console.log("request is legit");
    res.status(200).json({
      message: "OK",
    });
  } else {
    res.status(403).json({ message: "Invalid" });
  }
});

app.post("/razorpay", async (req, res) => {
  const payment_capture = 1;
  const amount = 60000;
  const currency = "INR";

  // also save this in medzgo document
  const options = {
    amount,
    currency,
    receipt: shortid.generate(),
    payment_capture,
  };

  try {
    const response = await razorpay.orders.create(options);
    console.log(response); // rsponse shown
    res.status(200).json({
      id: response.id,
      currency: response.currency,
      amount: response.amount,
    });
  } catch (err) {
    console.log(err);
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});

*/
