const { fetchTransactionByMerchantRequestID } = require("../mongoose/database");


const validateTransaction = async (req, res, next) => {
    console.log("validation url",req.body);
    res.sendStatus(200);
}

module.exports = { validateTransaction };
