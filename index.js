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

app.use(errorHandler);
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
app.use('/api/v1', authentication);

app.get('/callback', (req, res) => {
    const { Body, To, From } = req.query;
    const message = { Body, To, From };
    fs.writeFile('message.json', JSON.stringify(message), (err) => {
        if (err) {
            console.log(err);
        }
        console.log('Message saved');
    });
    res.send('Message saved');
});

// Start the server
server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
