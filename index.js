const express = require('express');
const http = require('http');
const axios = require('axios');
const moment = require('moment');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const dotenv = require('dotenv').config();
const app = express();
const server = http.createServer(app);
const { errorHandler } = require('./middleware/errorHandler');
const port = process.env.PORT || 5000;
const hostname = 'localhost';


app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


app.get('/', (req, res) => {
    if (req.accepts('html')) {
        res.sendFile(__dirname + '/public/index.html');
        return;
    } else if (req.accepts('json')) {
        res.json({ message: "Welcome to the MPESA API" });
        return;
    } else {
        res.send('Welcome to the MPESA API');
    }
}
);
//static files to use css
app.use(express.static('public'));


const authentication = require('./routes/authentication');
app.use('/api/', authentication);

// app.get('/callback', (req, res) => {
//     const { Body, To, From } = req.query;
//     const message = { Body, To, From };
//     fs.writeFile('message.json', JSON.stringify(message), (err) => {
//         if (err) throw err;
//         console.log('Message saved');
//     });
//     res.send('Message saved');
// });
// app.use(errorHandler);
// // Start the server
// server.listen(port, hostname, () => {
//     console.log(`Server running at http://${hostname}:${port}/`);
// });
app.use("/callback", (req, res) => {
  console.log("STK PUSH CALLBACK");
  const merchantRequestID = req.body.Body.stkCallback.MerchantRequestID;
  const checkoutRequestID = req.body.Body.stkCallback.CheckoutRequestID;
  const resultCode = req.body.Body.stkCallback.ResultCode;
  const resultDesc = req.body.Body.stkCallback.ResultDesc;
  const callbackMetadata = req.body.Body.stkCallback.CallbackMetadata;
  const amount = callbackMetadata.Item[0].Value;
  const mpesaReceiptNumber = callbackMetadata.Item[1].Value;
  const transactionDate = callbackMetadata.Item[3].Value;
  const phoneNumber = callbackMetadata.Item[4].Value;

  console.log("MerchantRequestID:", merchantRequestID);
  console.log("CheckoutRequestID:", checkoutRequestID);
  console.log("ResultCode:", resultCode);
  console.log("ResultDesc:", resultDesc);
  
  console.log("Amount:", amount);
  console.log("MpesaReceiptNumber:", mpesaReceiptNumber);
  console.log("TransactionDate:", transactionDate);
  console.log("PhoneNumber:", phoneNumber);

  var json = JSON.stringify(req.body);
  fs.writeFile("stkcallback.json", json, "utf8", function (err) {
    if (err) {
      return console.log(err);
    }
    console.log("STK PUSH CALLBACK STORED SUCCESSFULLY");
  });
});

