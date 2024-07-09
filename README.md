

# M-Pesa Stk Push Backend

This backend code is designed to facilitate M-Pesa Stk Push transactions. It includes functionality for generating OAuth tokens, initiating Stk Push transactions, and handling callbacks for transaction status updates.

## Prerequisites

Before running the backend code, make sure you have the following set up:

- Node.js installed
- npm (Node Package Manager) installed
- MongoDB or another database (For storing transaction data)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/Domains18/NodejsDaraja

```

2. Navigate to the project directory:

```bash 
cd /path/to/your/backend

```

3. Install dependencies:

``` bash
npm install

```

4. Set up environment variables:

Create a `.env` file in the project root and configure the following variables:
the following envirronment can be obtained from safaricom daraja portal 
```env
consumer_key=your_consumer_key
consumer_secret=your_consumer_secret
shortcode=your_mpesa_shortcode
passkey=your_mpesa_passkey
MONGODB_URI=your_mongodb_uri

```

5. Start the server:

```bash 
npm start

```

The backend server should now be running.

## Endpoints

### 1. Generate OAuth Token and PushStk

- **Endpoint:** `/api/stkpush`
- **Method:** `POST`
- **Description:** Generates an OAuth token required for M-Pesa API requests and innitiates a pushstk request.

### 3. Callback for Transaction Status

- **Endpoint:** `/api/callback`
- **Method:** `POST`
- **Description:** Handles callbacks from M-Pesa to update transaction status.


## Additional Information

- This backend code uses Axios for making HTTP requests.
- Transaction data is stored in a MongoDB database.
- Callbacks from M-Pesa are handled to update the transaction status.

Feel free to customize and extend the backend based on your specific requirements.

## License

This project is licensed under the [MIT License](LICENSE).

---

