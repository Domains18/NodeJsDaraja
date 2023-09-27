import functions from 'firebase-functions';
import admin from 'firebase-admin'
import { v4 as uuidv4 } from 'uuid';



admin.initializeApp(functions.config().firebase)
import express from 'express';
import bodyParser from 'body-parser';


const app = express();
app.use(bodyParser.json());
app.disable('x-powered-by');


app.post('/callback', async (req: express.Request, res: express.Response) => {
    const response = { 'ResultCode': 0, 'ResultDesc': 'Success' };

   re 
});
