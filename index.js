const express = require('express');
const app = express();
const http = require('http');
const bodyParser = require('body-parser');
const axios = require('axios');
const moment = require('moment');
const cors = require('cors');
const apiRouter = require('./api/api');

const port = 5000;
const hostname = 'localhost';
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/', apiRouter);

const server = http.createServer(app);

//access_token function 
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
        return accessToken;
    } catch (error) {
        throw new Error(error);
    }
}


// app.get('/', (req, res) => {
//     res.send("Engineered well, engineered to last");
//     let timestamp = moment().format('YYYYMMDDHHmmss');
//     console.log(timestamp);
// });


app.get('/access_token', async (req, res) => {
    try {
        const accessToken = await getAccessToken();
        res.json({ accessToken });
    } catch (error) {
        res.json(error);
    }
});


app.get('/stkpush', async (req, res) => {
    getAccessToken()
        .then((accessToken) => {
            const url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";
            const auth = "Bearer " + accessToken;
            const timestamp = moment().format('YYYYMMDDHHmmss');
            const password = new Buffer.from(process.env.PASSKEY + process.env.SHORTCODE + timestamp).toString("base64");

            axios.post(url, {
                businessShortCode: 174379,
                password: password,
                timestamp: timestamp,
                transactionType: "CustomerPayBillOnline",
                amount: 1,
                partyA: 254708374149,
                partyB: 174379,
                phoneNumber: 254708374149,
                callBackURL: "https://engineeredwellengineeredtolast.com", //TODO: Add my callback url
                accountReference: "account",
                transactionDesc: "test"
            }, {
                headers: {
                    "Authorization": auth
                }
            })
                .then((response) => {
                    res.send("Request sent successfully, complete the transaction on your phone by entering your pin")
                })
                .catch((error) => {
                    res.json(error);
                })
        });
});


//register url for c2b
app.get('/register', async (req, res) => {
    getAccessToken()
        .then((accessToken) => {
            const url = "https://sandbox.safaricom.co.ke/mpesa/c2b/v1/registerurl";
            const auth = "Bearer " + accessToken;
            axios.post(url, {
                ShortCode: 174379,
                ResponseType: "Completed",
                ConfirmationURL: "https://engineeredwellengineeredtolast.com/confirmation", //TODO: Add my confirmation url
                ValidationURL: "https://engineeredwellengineeredtolast.com/validation" //TODO: Add my validation url
            }, {
                headers: {
                    "Authorization": auth
                }
            })
                .then((response) => {
                    res.send(response.data);
                })
                .catch((error) => {
                    res.send(error);
                })
        });
});

app.get('/confirmation', (req, res) => {
    console.log(req.body);
    fs.writeFile('confirmation.json', JSON.stringify(req.body), (err) => {
        if (err) {
            console.log(err);
        }
    });
});

app.get("/b2curlrequest", (req, res) => {
    getAccessToken()
        .then((accessToken) => {
            const securityCredential =
                "N3Lx/hisedzPLxhDMDx80IcioaSO7eaFuMC52Uts4ixvQ/Fhg5LFVWJ3FhamKur/bmbFDHiUJ2KwqVeOlSClDK4nCbRIfrqJ+jQZsWqrXcMd0o3B2ehRIBxExNL9rqouKUKuYyKtTEEKggWPgg81oPhxQ8qTSDMROLoDhiVCKR6y77lnHZ0NU83KRU4xNPy0hRcGsITxzRWPz3Ag+qu/j7SVQ0s3FM5KqHdN2UnqJjX7c0rHhGZGsNuqqQFnoHrshp34ac/u/bWmrApUwL3sdP7rOrb0nWasP7wRSCP6mAmWAJ43qWeeocqrz68TlPDIlkPYAT5d9QlHJbHHKsa1NA==";
            const url = "https://sandbox.safaricom.co.ke/mpesa/b2c/v1/paymentrequest";
            const auth = "Bearer " + accessToken;
            axios
                .post(
                    url,
                    {
                        InitiatorName: "testapi",
                        SecurityCredential: securityCredential,
                        CommandID: "PromotionPayment",
                        Amount: "1",
                        PartyA: "600996",
                        PartyB: "254768168060",
                        Remarks: "Withdrawal",
                        QueueTimeOutURL: "https://mydomain.com/b2c/queue",
                        ResultURL: "https://mydomain.com/b2c/result",
                        Occasion: "Withdrawal",
                    },
                    {
                        headers: {
                            Authorization: auth,
                        },
                    }
                )
                .then((response) => {
                    res.status(200).json(response.data);
                })
                .catch((error) => {
                    console.log(error);
                    res.status(500).send("❌ Request failed");
                });
        })
        .catch(console.log);
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
