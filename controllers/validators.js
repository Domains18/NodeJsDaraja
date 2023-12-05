const { fetchTransactionByMerchantRequestID } = require("../mongoose/database");


const validateTransaction = async (req, res, next) => {
    const { merchantRequestID } = req.body;
    const transaction = await fetchTransactionByMerchantRequestID(merchantRequestID);
    if (transaction == null) {
        return res.status(404).json({ message: 'Cannot find transaction' });
    }
    if (transaction.ResultCode == 0) {
        return res.status(200).json({ message: 'Transaction successful' });
    } else {
        return res.status(400).json({ message: 'Transaction failed' });
    }
}

module.exports = { validateTransaction };
