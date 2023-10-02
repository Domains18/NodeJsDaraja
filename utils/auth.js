const crypto = require('crypto');
const secret = 'abcdefg';



const passkey=(randomThings, secret) => {
    return crypto.createHmac('sha256', secret)
        .update(randomThings)
        .digest('hex');
}


const generatePassword = (length) => {
    return crypto.randomBytes(length).toString('hex');
}

exports.passkey = passkey;
