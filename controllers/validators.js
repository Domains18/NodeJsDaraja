const { fetchTransactionByMerchantRequestID } = require("../mongoose/database");


const validateTransaction = async (req, res, next) => {
    const { payload } = req.body;
    const { MerchantRequestID } = payload.MerchantRequestID

    try {
        const transaction = await fetchTransactionByMerchantRequestID(MerchantRequestID);
        if (transaction == null) {
            return res.status(404).json({ message: 'Cannot find transaction' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
}

module.exports = { validateTransaction };
