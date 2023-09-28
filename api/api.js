const express = require('express');
const router = express.Router();
const axios = require('axios');
const fs = require('fs');
const moment = require('moment');
const expressAsyncHandler = require('express-async-handler');

// Define your constants
const consumerKey = "fBa4D6r7TP7YJleGoeIJ6AnNCUDpQBlt";
const consumerSecret = "GeYN83b51fEiA6Kt";
const businessShortCode = "174379";

// Define your utility functions

async function getAccessToken() {
    const url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";
    const auth = "Basic " + Buffer.from(consumerKey + ":" + consumerSecret).toString("base64");
    
    try {
        const response = await axios.get(url, {
            headers: {
                "Authorization": auth
            }
        });
        return response.data.access_token;
    } catch (error) {
        throw new Error(error.message);
    }
}

async function makeSTKPushRequest(accessToken, phoneNumber, accountNumber, amount) {
    try {
        const url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";
        const auth = "Bearer " + accessToken;
        const timestamp = moment().format('YYYYMMDDHHmmss');
        const password = Buffer.from(businessShortCode + "YOUR_PASSKEY" + timestamp).toString("base64");
        const accountReference = accountNumber;
        const transactionDesc = "Pay " + amount + " to " + accountNumber;

        const request = {
            "BusinessShortCode": businessShortCode,
            "Password": password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline",
            "Amount": amount,
            "PartyA": phoneNumber,
            "PartyB": businessShortCode,
            "PhoneNumber": phoneNumber,
            "CallBackURL": "/", // TODO: Add your callback URL
            "AccountReference": accountReference,
            "TransactionDesc": transactionDesc
        };

        const response = await axios.post(url, request, {
            headers: {
                "Authorization": auth
            }
        });

        return response.data;
    } catch (error) {
        throw new Error(error.message);
    }
}

// Define your routes

router.get('/api/home', (req, res) => {
    res.send('api works');
    console.log('api works');
});

router.get('/api/access_token', expressAsyncHandler(async (req, res) => {
    try {
        const accessToken = await getAccessToken();
        res.json("PROMISE RESOLVED: " + accessToken);
    } catch (err) {
        res.json("PROMISE REJECTED: " + err.message);
    }
}));

router.post('/api/stkpush', expressAsyncHandler(async (req, res) => {
    try {
        let phoneNumber = req.body.phoneNumber;
        const accountNumber = req.body.accountNumber;
        let amount = req.body.amount;

        if (phoneNumber.charAt(0) === '0') {
            phoneNumber = phoneNumber.replace('0', '254');
        }

        console.log('daemon received the following data: ' + phoneNumber + ' ' + accountNumber + ' ' + amount);

        const accessToken = await getAccessToken();
        const response = await makeSTKPushRequest(accessToken, phoneNumber, accountNumber, amount);

        console.log(response);

        res.status(200).json({
            message: "Request sent, please enter your pin to complete the transaction",
            status: true
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Request failed",
            status: false
        });
    }
}));

router.post("/api/callback", (req, res) => {
    // Handle your callback logic here
    console.log("STK PUSH CALLBACK: ");
    // Extract and process callback data

    let json = JSON.stringify(req.body);
    fs.writeFile('stkpush.json', json, 'utf8', (err) => {
        if (err) {
            return console.log(err);
        }
        console.log("JSON file created");
    });
});

module.exports = router;
