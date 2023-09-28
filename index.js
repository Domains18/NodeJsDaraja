const express = require('express');
const app = express();
const http = require('http');
const bodyParser = require('body-parser');
const axios = require('axios');
const moment = require('moment');
const cors = require('cors');


const port = 5000;
const hostname = 'localhost';
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
