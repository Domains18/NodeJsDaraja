const expressAsyncHandler = require("express-async-handler");
const axios = require("axios");


const createToken = expressAsyncHandler(async (req, res) => {
    try {
        const secret = process.env.CONSUMER_SECRET
        const consumerKey = process.env.CONSUMER_KEY;
        const auth = new Buffer.from(consumerKey + ":" + secret).toString("base64");

        await axios.get("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
            headers: {authorization: "Basic " + auth}
        })
            .then((data) => {
                const token = data.data.access_token;
                res.json({token});
            }
        ).catch((err) => {
            throw new Error(err);
        })
    } catch (err) {
        throw new Error(err);
    }
});


exports.createToken = createToken;
