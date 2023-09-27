import functions from 'firebase-functions';
import admin from 'firebase-admin'



admin.initializeApp(functions.config().firebase)
import express from 'express';
import bodyParser from 'body-parser';


const app = express();
app.use(bodyParser.json());
app.disable('x-powered-by');


app.post('/callback', async (req: express.Request, res: express.Response) => {
    const response = { 'ResultCode': 0, 'ResultDesc': 'Success' };

    res.status(200).json(response);

    const requestBody = req.body;
    const myPayload = JSON.stringify(requestBody);

    console.log(myPayload);

    let topicId = requestBody.Body.stkCallback.CheckoutRequestID; '

    const sentPayload = {
        data: {
            myPayload
        },
        "Body": {
            "stkCallback": {
                "MerchantRequestID": requestBody.Body.stkCallback.MerchantRequestID,
                "CheckoutRequestID": requestBody.Body.stkCallback.CheckoutRequestID,
                "ResultCode": requestBody.Body.stkCallback.ResultCode,
                "ResultDesc": requestBody.Body.stkCallback.ResultDesc
            }
        },
        "topic": topicId

    };
    return admin.messaging().send(sentPayload)
        .catch(error => {
            console.error(error)
        })
});

exports.api = functions.https.onRequest(app);
