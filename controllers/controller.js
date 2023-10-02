const expressAsyncHandler = require('express-async-handler');
const moment = require('moment');
const axios = require('axios');
const createToken =require('../middleware/accessMiddleware').createToken;



const makeStkPush = expressAsyncHandler(async (req, res) => {
    const { phoneNumber, amount } = req.body;
    if (!phoneNumber || !amount) {
        res.status(400).json({
            message: "Phone number and amount are required"
        });
        return;
    }
    const shortCode = "174379";
    const passkey = createToken(alphauser, alphapass);
    const url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";

    const date = moment().format("YYYYMMDDHHmmss");
    const timestamp = new Buffer.from(date).toString("base64");

    const password = new Buffer.from(shortCode + passkey + timestamp).toString("base64");
    const data = {
        BusinessShortCode: shortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: phoneNumber,
        PartyB: shortCode,
        PhoneNumber: phoneNumber,
        CallBackURL: "https://sandbox.safaricom.co.ke/mpesa/", //replace with your own
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
});


exports.makeStkPush = makeStkPush;
