// const expressAsyncHandler = require('express-async-handler');
// const moment = require('moment');
// const axios = require('axios');


// const makeStkPush = expressAsyncHandler(async (req, res) => {
//    try {
//     const shortCode = "174379";
//     const passkey = "b0b2b4b0b2b4b0b2b4b0b2b4b0b2b4b0";
//     const url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";
//     const date = moment().format("YYYYMMDDHHmmss");
//     const timestamp = new Buffer.from(date).toString("base64");
//     const password = new Buffer.from(shortCode + passkey + timestamp).toString("base64");
//     const data = {
//         BusinessShortCode: shortCode,
//         Password: password,
//         Timestamp: timestamp,
//         TransactionType: "CustomerPayBillOnline",
//         Amount: 1,
//         PartyA: 254757387606,
//         PartyB: 9324243,
//         PhoneNumber: 254757387606,
//         CallBackURL: "https://goose-merry-mollusk.ngrok-free.app/callback",
//         AccountReference: "Test",
//         TransactionDesc: "Test"
//     };
//     await axios.post(url, data, {
//         headers: {
//             Authorization: "Bearer " + token
//         }
//     }).then((data) => {
//         res.json(data.data);
//     }).catch((err) => {
//         res.status(500).json({ message: err.message });
//     });
//    } catch (error) {
//     throw new Error(error);
//    }
// });


// exports.makeStkPush = makeStkPush;

const axios = require("axios");

//middleware
const createToken = async (req, res, next) => {
  const secret = process.env.CONSUMER_SECRET;
  const consumer = process.env.CONSUMER_KEY
  const auth = new Buffer.from(`${consumer}:${secret}`).toString("base64");
  await axios
    .get(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        headers: {
          authorization: `Basic ${auth}`,
        },
      }
    )
    .then((data) => {
      token = data.data.access_token;
      console.log(data.data);
      next();
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json(err.message);
    });
};

//stk push
const postStk = async (req, res) => {
  const shortCode = 174379;
  const phone = 757387606;
  const amount = req.body.amount || 1;
  const passkey =
    "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";
  const url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";

  const date = new Date();
  const timestamp =
    date.getFullYear() +
    ("0" + (date.getMonth() + 1)).slice(-2) +
    ("0" + date.getDate()).slice(-2) +
    ("0" + date.getHours()).slice(-2) +
    ("0" + date.getMinutes()).slice(-2) +
    ("0" + date.getSeconds()).slice(-2);
  const password = new Buffer.from(shortCode + passkey + timestamp).toString(
    "base64"
  );
  const data = {
    BusinessShortCode: shortCode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: amount,
    PartyA: `254${phone}`,
    PartyB: 174379,
    PhoneNumber: `254${phone}`,
    CallBackURL: "https://goose-merry-mollusk.ngrok-free.app/callback",
    AccountReference: "Mpesa Test",
    TransactionDesc: "Testing stk push",
  };

  await axios
    .post(url, data, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    })
    .then((data) => {
      console.log(data);
      res.status(200).json(data.data);
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json(err.message);
    });
};

module.exports = { createToken, postStk };
