const expressAsyncHandler = require('express-async-handler');
const moment = require('moment');
const axios = require('axios');


const makeStkPush = expressAsyncHandler(async (req, res) => {
   try {
    const token = req.token;
    const shortCode = "174379";
    const passkey = "b0b2b4b0b2b4b0b2b4b0b2b4b0b2b4b0";
    const url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";
    const date = moment().format("YYYYMMDDHHmmss");
    const timestamp = new Buffer.from(date).toString("base64");
    const password = new Buffer.from(shortCode + passkey + timestamp).toString("base64");
    const data = {
        BusinessShortCode: shortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: 1,
        PartyA: 254757387606,
        PartyB: 9324243,
        PhoneNumber: 254757387606,
        CallBackURL: "https://goose-merry-mollusk.ngrok-free.app/callback",
        AccountReference: "Test",
        TransactionDesc: "Test"
    };
    await axios.post(url, data, {
        headers: {
            Authorization: "Bearer " + token
        }
    }).then((data) => {
        res.json(data.data);
    }).catch((err) => {
        res.status(500).json({ message: err.message });
    });
   } catch (error) {
    throw new Error(error);
   }
});


exports.makeStkPush = makeStkPush;
