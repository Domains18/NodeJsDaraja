const expressAsyncHandler = require('express-async-handler');
const moment = require('moment');



const makeStkPush = expressAsyncHandler(async (req, res) => {
    const { phoneNumber, amount } = req.body;
    if (!phoneNumber || !amount) {
        res.status(400).json({
            message: "Phone number and amount are required"
        });
        return;
    }
    const shortCode = "174379";
});
