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

const port = process.env.PORT || 5000;
const hostname = 'localhost';

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));



// Start the server
server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
