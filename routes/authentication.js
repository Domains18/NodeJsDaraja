const express = require('express');
const router = express.Router();

const {createToken, postStk, callback} = require('../controllers/controller');
const { validateTransaction } = require('../controllers/validators');

router.post('/stkpush',createToken, postStk);
router.post('/callback', callback);
router.post('/validate', validateTransaction);


module.exports = router;
