export const MPESA_URLS = {
    SANDBOX: {
        OAUTH: 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
        STK_PUSH: 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
        C2B_REGISTER: 'https://sandbox.safaricom.co.ke/mpesa/c2b/v1/registerurl',
        C2B_SIMULATE: 'https://sandbox.safaricom.co.ke/mpesa/c2b/v1/simulate',
        B2C: 'https://sandbox.safaricom.co.ke/mpesa/b2c/v1/paymentrequest',
        B2B: 'https://sandbox.safaricom.co.ke/mpesa/b2b/v1/paymentrequest',
        ACCOUNT_BALANCE: 'https://sandbox.safaricom.co.ke/mpesa/accountbalance/v1/query',
        TRANSACTION_STATUS: 'https://sandbox.safaricom.co.ke/mpesa/transactionstatus/v1/query',
        REVERSAL: 'https://sandbox.safaricom.co.ke/mpesa/reversal/v1/request',
        DYNAMIC_QR: 'https://sandbox.safaricom.co.ke/mpesa/qrcode/v1/generate',
        BILL_ONBOARD: 'https://sandbox.safaricom.co.ke/v1/billmanager-invoice/optin',
        BILL_MODIFY: 'https://sandbox.safaricom.co.ke/v1/billmanager-invoice/change-bill',
        BILL_BULK: 'https://sandbox.safaricom.co.ke/v1/billmanager-invoice/bulk-invoice',
        BILL_RECONCILE: 'https://sandbox.safaricom.co.ke/v1/billmanager-invoice/reconciliation',
    },
    PRODUCTION: {
        OAUTH: 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
        STK_PUSH: 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
        C2B_REGISTER: 'https://api.safaricom.co.ke/mpesa/c2b/v1/registerurl',
        C2B_SIMULATE: 'https://api.safaricom.co.ke/mpesa/c2b/v1/simulate',
        B2C: 'https://api.safaricom.co.ke/mpesa/b2c/v1/paymentrequest',
        B2B: 'https://api.safaricom.co.ke/mpesa/b2b/v1/paymentrequest',
        ACCOUNT_BALANCE: 'https://api.safaricom.co.ke/mpesa/accountbalance/v1/query',
        TRANSACTION_STATUS: 'https://api.safaricom.co.ke/mpesa/transactionstatus/v1/query',
        REVERSAL: 'https://api.safaricom.co.ke/mpesa/reversal/v1/request',
        DYNAMIC_QR: 'https://api.safaricom.co.ke/mpesa/qrcode/v1/generate',
        BILL_ONBOARD: 'https://api.safaricom.co.ke/v1/billmanager-invoice/optin',
        BILL_MODIFY: 'https://api.safaricom.co.ke/v1/billmanager-invoice/change-bill',
        BILL_BULK: 'https://api.safaricom.co.ke/v1/billmanager-invoice/bulk-invoice',
        BILL_RECONCILE: 'https://api.safaricom.co.ke/v1/billmanager-invoice/reconciliation',
    },
};

export const TRANSACTION_TYPES = {
    C2B: {
        CUSTOMER_PAY_BILL_ONLINE: 'CustomerPayBillOnline',
        CUSTOMER_BUY_GOODS_ONLINE: 'CustomerBuyGoodsOnline',
    },
    B2C: {
        SALARY_PAYMENT: 'SalaryPayment',
        BUSINESS_PAYMENT: 'BusinessPayment',
        PROMOTION_PAYMENT: 'PromotionPayment',
    },
    B2B: {
        BUSINESS_PAY_BILL: 'BusinessPayBill',
        MERCHANT_TO_MERCHANT: 'MerchantToMerchantTransfer',
        MERCHANT_FROM_MERCHANT: 'MerchantTransferFromMerchantToWorking',
        MERCHANT_SERVICES_MMFACCOUNT: 'MerchantServicesMMFAccountTransfer',
        AGENCY_FLOAT_ADVANCE: 'AgencyFloatAdvance',
    },
    REVERSAL: {
        TRANSACTION_REVERSAL: 'TransactionReversal',
    },
    ACCOUNT_BALANCE: {
        ACCOUNT_BALANCE: 'AccountBalance',
    },
    TRANSACTION_STATUS: {
        TRANSACTION_STATUS_QUERY: 'TransactionStatusQuery',
    },
};

export const IDENTIFIER_TYPES = {
    MSISDN: 1, // Phone number
    TILL_NUMBER: 2, // Till number
    SHORTCODE: 4, // Organization shortcode
    PAYBILL: 4, // PayBill shortcode (same as shortcode)
};

export const QR_TRANSACTION_CODES = {
    BUY_GOODS: 'BG', // Buy Goods
    PAY_BILL: 'PB', // Pay Bill
    SEND_MONEY: 'SM', // Send Money (Person to Person)
    WITHDRAW_CASH: 'WA', // Withdraw Cash (Agent)
};

export const RESPONSE_TYPES = {
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
};
