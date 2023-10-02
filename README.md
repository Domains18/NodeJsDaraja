# mpesa api integration

- [x] [Lipa na Mpesa Online](https://developer.safaricom.co.ke/docs#lipa-na-m-pesa-online)
- [x] [C2B API](https://developer.safaricom.co.ke/docs#introduction)
- [x] [B2C API](https://developer.safaricom.co.ke/docs#b2c-api)
- [x] [B2B API](https://developer.safaricom.co.ke/docs#b2b-api)
- [x] [Account Balance API](https://developer.safaricom.co.ke/docs#account-balance-api)
- [x] [Transaction Status API](https://developer.safaricom.co.ke/docs#transaction-status-api)
- [x] [Reversal API](https://developer.safaricom.co.ke/docs#reversal-api)
- [x] [STK Push API](https://developer.safaricom.co.ke/docs#stk-push-api)
- [x] [STK Query API](https://developer.safaricom.co.ke/docs#stk-query-api)
- [x] [Transaction Status API](https://developer.safaricom.co.ke/docs#transaction-status-api)
- [x] [Account Balance API](https://developer.safaricom.co.ke/docs#account-balance-api)
- [x] [Transaction Status API](https://developer.safaricom.co.ke/docs#transaction-status-api)
- [x] [Reversal API](https://developer.safaricom.co.ke/docs#reversal-api)
   )

# Definition of terms
- PartyA this is the phone number making the payments
-PhoneNumber- This is the phone number making the payment [same as PartyA]
- PartyB This is the shortcode of the organization receiving the payment
- Account Reference- This is an Alpha-Numeric parameter that is defined by your system as an Identifier of the transaction for CustomerPayBillOnline transaction type. Along with the business name, this value is also displayed to the customer in the STK PIN Prompt message. Maximum of 12 characters.
- TransactionDesc This is any additional information/comment that can be sent along with the request from your system. Maximum of 13 Characters.
- Amount This is the Amount transacted, normally sent by your system. e.g. 100.
- MpesaReceiptNumber This is a parameter used to send the transaction Unique Identifier for CustomerPayBillOnline transaction type, normally sent by MPesa after payment is made. e.g. LGR2345.
- TransactionDate This is the date and time of the transaction, normally sent by MPesa after payment is made. e.g. 20160105120900.
