const { fetchTransactionByMerchantRequestID } = require("../mongoose/database");


const validateTransaction = async (req, res, next) => {
    const { payload } = req.body;
    const { MerchantRequestID } = payload.MerchantRequestID

    try {
        const transaction = await fetchTransactionByMerchantRequestID(MerchantRequestID);
        if (transaction == null) {
            return res.status(404).json({ message: 'Cannot find transaction' });
        } else {
            res.status(200).json(transaction);
            console.log(transaction);
            next();
        }
    } catch (error) {
        return res.status(500).json({ message: err.message });
    }
}

module.exports = { validateTransaction };
