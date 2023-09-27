import express from 'express';
import bodyParser from 'body-parser';



const app = express();
app.use(bodyParser.json());
const port = 3000;



app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/mpesa/callback', (req, res) => {
    console.log(req.body);
    res.send('Hello World!');
});
