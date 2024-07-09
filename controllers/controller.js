

const axios = require("axios");
const { saveTransaction} = require("../mongoose/database");


//middleware
const createToken = async (req, res, next) => {
  const secret = process.env["secret_key];
  const consumer = process.env["consumer_key"]
  const auth = new Buffer.from(`${consumer}:${secret}`).toString("base64");
  const url_dev = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";
  await axios
    .get(
      url_dev,
      {
        headers: {
          authorization: `Basic ${auth}`,
        },
      }
    )
    .then((data) => {
      token = data.data.access_token;
      // console.log("TOKEN", token);
      next();
    })
    .catch((err) => {
      res.status(400).json("TOKEN GENERETION ERROR: " + err.message);
    });
};

//stk push
const postStk = async (req, res) => {
  const {phone, amount} = req.body;
  if(!phone || !amount){
      return res.sendStatus(400).json("empty request body");
  }
  const shortCode = process.env["shortCode"]
  const passkey = process.env["passkey"]

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
    BusinessShortCode: "174379", // "174379",
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: amount,
    PartyA: phone,
    PartyB: "174379",
    PhoneNumber: phone,
    CallBackURL: "https://mydomain.com/pat",
    AccountReference: "Reject Finance Bill 2024",
    TransactionDesc: "Reject Finance Bill 2024",
  };
 stk_dev = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";
  await axios
    .post(stk_dev, data, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    })
    .then((data) => {
      const dataArray = [];
      dataArray.push(data.data);
      if (data.data.ResponseCode == 0) {
        const transaction = {
          MerchantRequestID: data.data.MerchantRequestID,
          CheckoutRequestID: data.data.CheckoutRequestID,
          ResultCode: data.data.ResponseCode,
          ResultDesc: data.data.ResponseDescription,
        };
      } else {
        res.sendStatus(400);
      }
      res.status(200).json(data.data);
    })
    .catch((err) => {
      res.status(422).json("STK PUSH ERROR: " + err.message);
      console.log(err);
    });
};


//callback
const callback = async (req, res) => {
  const data = req.body.Body.stkCallback;
  const transaction = {
    MerchantRequestID: data.MerchantRequestID,
    CheckoutRequestID: data.CheckoutRequestID,
    ResultCode: data.ResultCode,
    ResultDesc: data.ResultDesc,
    Amount: data.CallbackMetadata?.Item[0].Value,
    MpesaReceiptNumber: data.CallbackMetadata?.Item[1].Value,
    Balance: data.CallbackMetadata?.Item[2].Value,
    TransactionDate: data.CallbackMetadata?.Item[3].Value,
    PhoneNumber: data.CallbackMetadata?.Item[4].Value,
  };
};


module.exports = { createToken, postStk, callback};
