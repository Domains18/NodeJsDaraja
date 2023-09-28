const express = require('express');
const router = express.Router();
const axios = require('axios');
const fs = require('fs');
const moment = require('moment');
const expressAsyncHandler = require('express-async-handler');


router.get('/api/home', (req, res) => {
    res.send('api works');
    console.log('api works');
});


router.get('/api/access_token', expressAsyncHandler(async (req, res, err) => {
    getAccessToken()
        .then((accessToken) => {
            res.json("PROMISE RESOLVED: " + accessToken)
                .catch((err) => {
                    res.json("PROMISE REJECTED: " + err)
                })
        })
}))


async function getAccessToken() {
    const consumerKey = process.env.CONSUMER_KEY; //TODO: Add my consumer key
    const consumerSecret = process.env.CONSUMER_SECRET; //TODO: Add my consumer secret

    const url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";
    const auth = "Basic " + new Buffer.from(consumerKey + ":" + consumerSecret).toString("base64");
    try {
        const response = await axios.get(url, {
            headers: {
                "Authorization": auth
            }
        });
        const accessToken = response.data.access_token;
    } catch (error) {
        throw new Error(error);
    }
}

router.post('/api/stkpush', expressAsyncHandler(async (req, res) => {
    let phoneNumber = req.body.phoneNumber;
    const accountNumber = req.body.accountNumber;
    let amount = req.body.amount;

    if (phoneNumber.charAt(0) == '0') {
        phoneNumber = phoneNumber.replace('0', '254');
    }
}));

console.log('daemon received the following data: ' + phoneNumber + ' ' + accountNumber + ' ' + amount);

getAccessToken()
    .then((accessToken) => {
        const url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";
        const auth = "Bearer " + accessToken;
        const timestamp = moment().format('YYYYMMDDHHmmss');
        const password = new Buffer.from("174379" + "174379" + "174379").toString("base64");
        const accountReference = accountNumber;
        const transactionDesc = "Pay " + amount + " to " + accountNumber;
        const request = {
            "BusinessShortCode": "174379",
            "Password": password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline",
            "Amount": amount,
            "PartyA": phoneNumber,
            "PartyB": "174379",
            "PhoneNumber": phoneNumber,
            "CallBackURL": "/", //TODO: Add my callback url
            "AccountReference": accountReference,
            "TransactionDesc": transactionDesc
        };
        axios.post(url, request, {
            headers: {
                "Authorization": auth
            }
        })
            .then((response) => {
                console.log(response.data);
                res.status(200).json({
                    message: "Request sent, please enter your pin to complete the transaction",
                    status: true
                });
            })
            .catch((err) => {
                console.log(err);
                res.status(500).json({
                    message: "Request failed",
                    status: false
                });
            })
    })


router.post("/api/callback", (req, res) => {
    console.log("STK PUSH CALLBACK: ");
    const merchantRequestID = req.body.Body.stkCallback.merchantRequestID;
    const checkoutRequestID = req.body.Body.stkCallback.checkoutRequestID;
    const resultCode = req.body.Body.stkCallback.resultCode;
    const resultDesc = req.body.Body.stkCallback.resultDesc;
    const callbackMetadata = req.body.Body.stkCallback.callbackMetadata;
    const amount = callbackMetadata.Item[0].Value;
    const mpesaReceiptNumber = callbackMetadata.Item[1].Value;
    const transactionDate = callbackMetadata.Item[3].Value;
    const phoneNumber = callbackMetadata.Item[4].Value;

    console.log("Merchant Request ID: " + merchantRequestID);
    console.log("Checkout Request ID: " + checkoutRequestID);
    console.log("Result Code: " + resultCode);
    console.log("Result Desc: " + resultDesc);
    console.log("Amount: " + amount);
    console.log("Mpesa Receipt Number: " + mpesaReceiptNumber);
    console.log("Transaction Date: " + transactionDate);
    console.log("Phone Number: " + phoneNumber);
    

    let json = JSON.stringify(req.body);
    fs.writeFile('stkpush.json', json, 'utf8', (err) => {
        if (err) {
           return  console.log(err);
        }
        console.log("JSON file created");
    });
});
