### SERVER IMPLEMENTATION OF DARAJA API

-   This is an implementation of the Daraja API by Safaricom. This is a follow up of the previous implementation of the same API using Express.js. This time round, I have used Nestjs to implement the API.
    implement the API, adding other features offfered by Safaricom's Daraja API.
-   Typescript support is enabled in this project.

#### previous implementation of the same API using Express.js can be found in the branch [expressjs](https://github.com/Domains18/NodeJsDaraja/tree/expressjs-branch)

### Installation

-   Clone the repository

```bash
git clone https://github.com/Domains18/NodeJsDaraja.git
```

-   Install dependencies

```bash
pnpm install
```

-   Create a .env file in the root directory and add the following environment variables

```bash
PORT=3000
DATABASE_URL="mysql://user:password@localhost:3306/mpesa_db"
CONSUMER_KEY=YOUR_CONSUMER_KEY
CONSUMER_SECRET=YOUR_CONSUMER_SECRET
PASS_KEY=YOUR_PASSKEY
REDIS_URL=redis://localhost:6379
```

-   Start the server

```bash
pnpm start
```

-   The server will be running on http://localhost:3000

### CONTRIBUTING

-   Fork the repository
-   Create a new branch (feature/bug)
-   Make changes
-   Commit changes
-   Push changes to your branch
-   Create a pull request

### LICENSE

-   MIT License
-   [LICENSE](LICENSE)

### AUTHOR

-   Gibson Kemboi
-   [Email](mailto:dev.domains18@gmail.com)

### product of [NerdsCatapult](https://nerds.africa)
