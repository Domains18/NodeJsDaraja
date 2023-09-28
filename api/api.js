const express = require('express');
const router = express.Router();
const axios = require('axios');
const fs = require('fs');
const moment = require('moment');
const expressAsyncHandler = require('express-async-handler');


router.get('/api/home', (req, res) => {
    res.send('api works');
    console.log('api works');
});


router.get('/api/access_token', expressAsyncHandler(async (req, res, err) => {
    getAccessToken()
        .then((accessToken) => {
            res.json("PROMISE RESOLVED: " + accessToken)
                .catch((err) => {
                    res.json("PROMISE REJECTED: " + err)
                })
        })
}))
