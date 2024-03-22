

# M-Pesa Stk Push Backend

This backend code is designed to facilitate M-Pesa Stk Push transactions. It includes functionality for generating OAuth tokens, initiating Stk Push transactions, and handling callbacks for transaction status updates.

## Prerequisites

Before running the backend code, make sure you have the following set up:

- Node.js installed
- npm (Node Package Manager) installed
- MongoDB or another database (For storing transaction data)

## Installation

1. Clone the repository:

```bash {"id":"01HGZNS58XQD8Y1G1JR4N7Y0Y7"}
git clone https://github.com/Domains18/NodejsDaraja

```

2. Navigate to the project directory:

```bash {"id":"01HGZNS58XQD8Y1G1JR8AA3KWN"}
cd /path/to/your/backend

```

3. Install dependencies:

```bash {"id":"01HGZNS58YACW06V3H4C2001EH"}
npm install

```

4. Set up environment variables:

Create a `.env` file in the project root and configure the following variables:

```env {"id":"01HGZNS58YACW06V3H4FDT8KRM"}
CONSUMER_KEY=your_consumer_key
CONSUMER_SECRET=your_consumer_secret
MPESA_SHORTCODE=your_mpesa_shortcode
MPESA_PASSKEY=your_mpesa_passkey
MONGODB_URI=your_mongodb_uri

```

5. Start the server:

```bash {"id":"01HGZNS58YACW06V3H4GRT80Y9"}
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

- If you do not have postman or want to use a frontend, click here [FrontEnd]("https://github.com/Domains18/SafaricomDarajaFrontEnd.git") 

## Additional Information

- This backend code uses Axios for making HTTP requests.
- Transaction data is stored in a MongoDB database.
- Callbacks from M-Pesa are handled to update the transaction status.

Feel free to customize and extend the backend based on your specific requirements.

## License

This project is licensed under the [MIT License](LICENSE).

---

