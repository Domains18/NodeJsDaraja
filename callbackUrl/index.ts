import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import express from 'express';
import * as bodyParser from 'body-parser';

admin.initializeApp();

const app = express();
app.use(bodyParser.json());
app.disable('x-powered-by');

app.post('/callback', async (req: express.Request, res: express.Response) => {
  try {
    const requestBody = req.body;
    const topicId = requestBody.Body.stkCallback.CheckoutRequestID;

    // Send a success response to the M-Pesa API
    const response = { ResultCode: 0, ResultDesc: 'Success' };
    res.status(200).json(response);

    // Send the payload to Firebase Cloud Messaging (FCM)
    const sentPayload = {
      data: {
        myPayload: JSON.stringify(requestBody),
      },
      notification: {
        title: 'M-Pesa Callback',
        body: 'Payment received',
      },
      topic: topicId,
    };

    await admin.messaging().send(sentPayload);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export const api = functions.https.onRequest(app);
