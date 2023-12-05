

const axios = require("axios");

//middleware
const createToken = async (req, res, next) => {
  const secret = process.env.CONSUMER_SECRET;
  const consumer = process.env.CONSUMER_KEY
  const auth = new Buffer.from(`${consumer}:${secret}`).toString("base64");
  await axios
    .get(
      "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
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
      res.status(400).json("TOKEN GENERETION ERROR: " + err.message);
    });
};

//stk push
const postStk = async (req, res) => {
  const shortCode = process.env.MPESA_SHORTCODE;
  const phone = 759097030;
  const amount = 1;
  const passkey = process.env.MPESA_PASSKEY;

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
    PartyB: shortCode,
    PhoneNumber: `254${phone}`,
    CallBackURL: "https://goose-merry-mollusk.ngrok-free.app/api/callback",
    AccountReference: "purchase",
    TransactionDesc: "purchase",
  };

  await axios
    .post("https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest", data, {
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
      res.status(400).json("STK PUSH ERROR: " + err.message);
    });
};

module.exports = { createToken, postStk };
