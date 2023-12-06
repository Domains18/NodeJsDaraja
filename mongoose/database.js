const mongoose = require('mongoose');


const transactionSchema = new mongoose.Schema({
    MerchantRequestID: String,
    CheckoutRequestID: String,
    ResultCode: Number,
    ResultDesc: String,
    Amount: Number,
    MpesaReceiptNumber: String,
    Balance: Number,
    TransactionDate: Date,
    PhoneNumber: Number
});


const Transaction = mongoose.model('Transaction', transactionSchema);

const saveTransaction = async (values) => {
    const transaction = new Transaction({
        MerchantRequestID: values.MerchantRequestID,
        CheckoutRequestID: values.CheckoutRequestID,
        ResultCode: values.ResultCode,
        ResultDesc: values.ResultDesc,
        Amount: values.Amount,
        MpesaReceiptNumber: values.MpesaReceiptNumber,
        Balance: values.Balance,
        TransactionDate: values.TransactionDate,
        PhoneNumber: values.PhoneNumber
    });
    try {
        const newTransaction = await transaction.save();
        return newTransaction;
    } catch (err) {
        return err.message;
    }
}


const fetchTransactionByMerchantRequestID = async (req, res) => {
    try {
        const transaction = await Transaction.findOne({ MerchantRequestID: req.params.MerchantRequestID });
        if (transaction == null) {
            return res.status(404).json({ message: 'Cannot find transaction' });
        }
        res.json(transaction);
    } catch (err) {
        console.log(err);
    }
}


const fetchTransactionByCheckoutRequestID = async (req, res) => {
    try {
        const transaction = await Transaction.findOne({ CheckoutRequestID: req.params.CheckoutRequestID });
        if (transaction == null) {
            return res.status(404).json({ message: 'Cannot find transaction' });
        }
        res.json(transaction);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}


module.exports = { saveTransaction, fetchTransactionByMerchantRequestID, fetchTransactionByCheckoutRequestID };
