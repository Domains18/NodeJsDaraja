# NodeJS Daraja API - Complete M-Pesa Integration

A comprehensive NestJS implementation of Safaricom's Daraja API, providing complete M-Pesa payment integration for Kenya. This library supports all major Daraja API services including payments, transfers, queries, and billing.

## 🚀 Features

This implementation provides a complete suite of M-Pesa services:

- ✅ **M-Pesa Express (STK Push)** - Lipa Na M-Pesa Online payment prompts
- ✅ **C2B (Customer to Business)** - Receive PayBill and Till payments
- ✅ **B2C (Business to Customer)** - Send money to customers (payouts, refunds)
- ✅ **B2B (Business to Business)** - Transfer money between businesses
- ✅ **Account Balance** - Query M-Pesa account balance
- ✅ **Transaction Status** - Query transaction status by ID
- ✅ **Transaction Reversal** - Reverse/refund transactions
- ✅ **Dynamic QR** - Generate QR codes for payments
- ✅ **Bill Manager** - Recurring billing and invoice management

### Technical Features

- 🔒 **Security** - RSA encryption for sensitive data
- 📦 **Redis Caching** - Transaction state management
- 🗄️ **Database** - MySQL with Prisma ORM
- ✅ **Validation** - Request validation with class-validator
- 📝 **Logging** - Comprehensive error and operation logging
PORT=3000

# For a complete list of required environment variables,
# please refer to the .env.example file.
- Redis server
- Safaricom Daraja API credentials ([Get them here](https://developer.safaricom.co.ke))

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/Domains18/NodeJsDaraja.git
cd NodeJsDaraja
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Setup environment variables

Create a `.env` file in the root directory:

```bash
# Server Configuration
PORT=3000

# Database Configuration
DATABASE_URL="mysql://user:password@localhost:3306/mpesa_db"

# M-Pesa Environment (SANDBOX or PRODUCTION)
MPESA_ENV=SANDBOX

# Safaricom Daraja API Credentials
CONSUMER_KEY=YOUR_CONSUMER_KEY
CONSUMER_SECRET=YOUR_CONSUMER_SECRET

# STK Push Configuration
PASS_KEY=YOUR_PASSKEY
STK_SHORTCODE=174379
STK_CALLBACK_URL=https://yourdomain.com/api/mpesa/callback

# Initiator Credentials (for B2C, B2B, Balance, Status, Reversal)
INITIATOR_NAME=YOUR_INITIATOR_NAME
INITIATOR_PASSWORD=YOUR_INITIATOR_PASSWORD

# M-Pesa Certificate Path
MPESA_CERT_PATH=./certificates/ProductionCertificate.cer

# C2B Configuration
C2B_SHORTCODE=600496
C2B_VALIDATION_URL=https://yourdomain.com/api/c2b/validation
C2B_CONFIRMATION_URL=https://yourdomain.com/api/c2b/confirmation

# B2C Configuration
B2C_SHORTCODE=YOUR_B2C_SHORTCODE
B2C_RESULT_URL=https://yourdomain.com/api/b2c/callback/result
B2C_TIMEOUT_URL=https://yourdomain.com/api/b2c/callback/timeout

# B2B Configuration
B2B_SHORTCODE=YOUR_B2B_SHORTCODE
B2B_RESULT_URL=https://yourdomain.com/api/b2b/callback/result
B2B_TIMEOUT_URL=https://yourdomain.com/api/b2b/callback/timeout

# Account Balance Configuration
BALANCE_SHORTCODE=YOUR_SHORTCODE
BALANCE_RESULT_URL=https://yourdomain.com/api/account-balance/callback
BALANCE_TIMEOUT_URL=https://yourdomain.com/api/account-balance/timeout

# Transaction Status Configuration
STATUS_SHORTCODE=YOUR_SHORTCODE
STATUS_RESULT_URL=https://yourdomain.com/api/transaction-status/callback
STATUS_TIMEOUT_URL=https://yourdomain.com/api/transaction-status/timeout

# Reversal Configuration
REVERSAL_RESULT_URL=https://yourdomain.com/api/reversal/callback
REVERSAL_TIMEOUT_URL=https://yourdomain.com/api/reversal/timeout

# Dynamic QR Configuration
QR_MERCHANT_NAME=YOUR_MERCHANT_NAME

# Bill Manager Configuration
BILL_SHORTCODE=YOUR_BILL_SHORTCODE
BILL_EMAIL=your-email@example.com
BILL_OFFICIAL_CONTACT=YOUR_CONTACT
BILL_CALLBACK_URL=https://yourdomain.com/api/bill-manager/callback

# Redis Configuration
REDIS_URL=redis://localhost:6379
```

### 4. Setup M-Pesa Certificate (Production Only)

For production, download the M-Pesa public certificate:

```bash
# Download from Safaricom Daraja Portal
# Place it in: ./certificates/ProductionCertificate.cer
```

### 5. Run database migrations

```bash
# Generate Prisma client
pnpm exec prisma generate

# Run migrations
pnpm exec prisma migrate dev
```

### 6. Start the server

```bash
# Development mode
pnpm start:dev

# Production mode
pnpm build
pnpm start:prod
```

The server will be running on `http://localhost:3000`

## 📚 API Documentation

### Base URL

```
http://localhost:3000/api
```

---

## 1. M-Pesa Express (STK Push)

Initiate payment prompt on customer's phone.

**Endpoint:** `POST /api/mpesa/stkpush`

**Request:**
```json
{
  "phoneNum": "254712345678",
  "amount": 100,
  "accountRef": "INV001"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "MerchantRequestID": "29115-34620561-1",
    "CheckoutRequestID": "ws_CO_191220191020363925",
    "ResponseCode": "0",
    "ResponseDescription": "Success. Request accepted for processing"
  }
}
```

**Callback:** `POST /api/mpesa/callback`

---

## 2. C2B (Customer to Business)

### Register URLs

**Endpoint:** `POST /api/c2b/register`

**Request:**
```json
{
  "shortCode": "600496",
  "responseType": "Completed",
  "confirmationURL": "https://yourdomain.com/api/c2b/confirmation",
  "validationURL": "https://yourdomain.com/api/c2b/validation"
}
```

### Simulate Transaction (Sandbox)

**Endpoint:** `POST /api/c2b/simulate`

**Request:**
```json
{
  "shortCode": "600496",
  "commandID": "CustomerPayBillOnline",
  "amount": 100,
  "msisdn": "254708374149",
  "billRefNumber": "ACC001"
}
```

---

## 3. B2C (Business to Customer)

Send money to customer's phone.

**Endpoint:** `POST /api/b2c/payment`

**Request:**
```json
{
  "phoneNumber": "254712345678",
  "amount": 100,
  "commandId": "BusinessPayment",
  "remarks": "Salary payment",
  "occasion": "Monthly salary"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "ConversationID": "AG_20240221_0000123456789",
    "OriginatorConversationID": "12345-67890-1",
    "ResponseCode": "0",
    "ResponseDescription": "Accept the service request successfully."
  }
}
```

**Callbacks:**
- Result: `POST /api/b2c/callback/result`
- Timeout: `POST /api/b2c/callback/timeout`

---

## 4. B2B (Business to Business)

Transfer money between business accounts.

**Endpoint:** `POST /api/b2b/payment`

**Request:**
```json
{
  "commandId": "BusinessPayBill",
  "amount": 1000,
  "partyB": "600000",
  "accountReference": "ACC001",
  "remarks": "Payment to supplier"
}
```

**Callbacks:**
- Result: `POST /api/b2b/callback/result`
- Timeout: `POST /api/b2b/callback/timeout`

---

## 5. Account Balance

Query M-Pesa account balance.

**Endpoint:** `POST /api/account-balance/query`

**Request:**
```json
{
  "remarks": "Balance check"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "ConversationID": "AG_20240221_0000123456789",
    "OriginatorConversationID": "12345-67890-1",
    "ResponseCode": "0"
  }
}
```

**Callbacks:**
- Result: `POST /api/account-balance/callback`
- Timeout: `POST /api/account-balance/timeout`

---

## 6. Transaction Status

Query the status of a transaction.

**Endpoint:** `POST /api/transaction-status/query`

**Request:**
```json
{
  "transactionID": "LHG31AA5TV",
  "remarks": "Status check"
}
```

**Callbacks:**
- Result: `POST /api/transaction-status/callback`
- Timeout: `POST /api/transaction-status/timeout`

---

## 7. Transaction Reversal

Reverse a completed transaction.

**Endpoint:** `POST /api/reversal/request`

**Request:**
```json
{
  "transactionID": "LHG31AA5TV",
  "amount": 100,
  "receiverParty": "600496",
  "remarks": "Reversal for wrong payment"
}
```

**Callbacks:**
- Result: `POST /api/reversal/callback`
- Timeout: `POST /api/reversal/timeout`

---

## 8. Dynamic QR

Generate QR code for payments.

**Endpoint:** `POST /api/dynamic-qr/generate`

**Request:**
```json
{
  "merchantName": "My Shop",
  "refNo": "QR001",
  "amount": 100,
  "trxCode": "BG",
  "size": "300"
}
```

**Transaction Codes:**
- `BG` - Buy Goods
- `PB` - Pay Bill
- `WA` - Withdraw Cash
- `SM` - Send Money

**Response:**
```json
{
  "success": true,
  "data": {
    "ResponseCode": "00",
    "ResponseDescription": "Success",
    "QRCode": "base64-encoded-qr-image"
  }
}
```

---

## 9. Bill Manager

Manage recurring bills and invoices.

### Onboard Account

**Endpoint:** `POST /api/bill-manager/onboard`

**Request:**
```json
{
  "shortCode": "174379",
  "email": "billing@company.com",
  "officialContact": "254712345678",
  "sendReminders": true,
  "callBackUrl": "https://yourdomain.com/api/bill-manager/callback"
}
```

**Payment Callback:** `POST /api/bill-manager/callback`

---

## 🏗️ Project Structure

```
src/
├── core/                           # Shared utilities
│   ├── services/                   # SecurityCredential, Timestamp, CallbackHandler
│   └── utils/                      # Constants, Validators
├── mpesa-express/                  # STK Push
├── c2b/                           # Customer to Business
├── b2c/                           # Business to Customer
├── b2b/                           # Business to Business
├── account-balance/               # Account Balance
├── transaction-status/            # Transaction Status
├── reversal/                      # Transaction Reversal
├── dynamic-qr/                    # QR Code Generation
├── bill-manager/                  # Bill Management
└── services/                      # Auth, Prisma
```

## 🧪 Testing

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Test coverage
pnpm test:cov
```

## 🔧 Development

```bash
# Run in development mode with hot reload
pnpm start:dev

# Build for production
pnpm build

# Run production build
pnpm start:prod

# Lint code
pnpm lint

# Format code
pnpm format
```

## 📝 Logging

All HTTP requests are logged to `src/logs/access.log`. Service-level logs use NestJS Logger.

## 🐛 Troubleshooting

### Common Issues

**Certificate Error (Production)**
```
Solution: Download the M-Pesa certificate from Safaricom Portal and place in ./certificates/
```

**Database Connection Error**
```
Solution: Ensure MySQL is running and DATABASE_URL is correct
```

**Redis Connection Error**
```
Solution: Ensure Redis server is running on the configured REDIS_URL
```

**Token Generation Failed**
```
Solution: Verify CONSUMER_KEY and CONSUMER_SECRET are correct
```

## 📖 Additional Resources

- [Safaricom Daraja Portal](https://developer.safaricom.co.ke)
- [Daraja API Documentation](https://developer.safaricom.co.ke/APIs)
- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Gibson Kemboi**
- Email: [dev.domains18@gmail.com](mailto:dev.domains18@gmail.com)
- GitHub: [@Domains18](https://github.com/Domains18)

## 🏢 Product of

[NerdsCatapult](https://nerds.africa)

---

## ⭐ Show your support

Give a ⭐️ if this project helped you!

## 📚 Previous Versions

Previous Express.js implementation: [expressjs-branch](https://github.com/Domains18/NodeJsDaraja/tree/expressjs-branch)
