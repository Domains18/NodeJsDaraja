const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv').config();
const app = express();
const { errorHandler } = require('./middleware/errorHandler');
const mongoose = require('mongoose');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
    if (req.accepts('html')) {
        res.sendFile(__dirname + '/public/index.html');
        return;
    } else if (req.accepts('json')) {
        res.json({ message: "Welcome to the MPESA API" });
        return;
    } else {
        res.send('Welcome to the MPESA API');
    }
}
);
//static files to use css
app.use(express.static('public'));
const authentication = require('./routes/authentication');
app.use('/api/', authentication);

//mongoose
function connectDatabase() {
  mongoose
    .connect(process.env.MONGODB_URI, {})
    .then((result) => {
      console.log("Database connected");
    })
    .catch((err) => {
      console.log(err);
    });
}
connectDatabase();

app.use(errorHandler);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
