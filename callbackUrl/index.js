const express = require('express');
const bodyParser = require('body-parser');


const app = express();
app.use(bodyParser.json());
const port = 3000;



app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/mpesa/callback', (req, res) => {
    //create a log of the response
    console.log(req.body);
    res.status(200).send('success');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

