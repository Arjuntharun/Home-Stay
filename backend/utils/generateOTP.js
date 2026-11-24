const { randomInt, createHmac } = require('crypto');

function generateOTP() {
  return randomInt(100000, 1000000).toString();
}

function hashOTP(email, otp) {
  return createHmac('sha256', process.env.JWT_SECRET)
    .update('email-verification:' + email.trim().toLowerCase() + ':' + otp)
    .digest('hex');
}

module.exports = { generateOTP, hashOTP };
