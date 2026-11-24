const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const rateLimit = require('../middleware/rateLimit');

const router = express.Router();
const hash = token => crypto.createHash('sha256').update(token).digest('hex');

router.post('/forgot-password', rateLimit(5, 15 * 60 * 1000), [
  body('email').isString().trim().toLowerCase().isEmail()
], async (req, res, next) => {
  if (!validationResult(req).isEmpty()) {
    return res.status(400).json({ message: 'Enter a valid email address.' });
  }
  let resetUrl;
  try {
    resetUrl = new URL('/login/recover.html', process.env.PUBLIC_SITE_URL);
    if (resetUrl.protocol !== 'https:' && !(process.env.NODE_ENV !== 'production' && resetUrl.hostname === 'localhost' && resetUrl.protocol === 'http:')) {
      throw new Error('Invalid public site URL');
    }
  } catch {
    return res.status(503).json({ message: 'Password recovery is temporarily unavailable.' });
  }

  try {
    const token = crypto.randomBytes(32).toString('hex');
    const digest = hash(token);
    const now = Date.now();
    const user = await User.findOneAndUpdate({
      email: req.body.email,
      isEmailVerified: true,
      role: 'user',
      $or: [
        { resetExpires: null },
        { resetExpires: { $lte: new Date(now + 29 * 60 * 1000) } }
      ]
    }, {
      resetTokenHash: digest,
      resetExpires: new Date(now + 30 * 60 * 1000)
    });

    if (user) {
      resetUrl.hash = token;
      try {
        await sendEmail({
          email: user.email,
          subject: 'Reset your Hawkins Homestay password',
          text: 'Open this link within 30 minutes to reset your password:\n\n' + resetUrl.href
        });
      } catch {
        await User.updateOne({ _id: user._id, resetTokenHash: digest }, {
          $unset: { resetTokenHash: 1, resetExpires: 1 }
        });
      }
    }
    res.json({ message: 'If an eligible account exists, a password reset link will be sent.' });
  } catch (error) {
    next(error);
  }
});

router.post('/reset-password', rateLimit(10, 15 * 60 * 1000), [
  body('token').isString().matches(/^[a-f0-9]{64}$/),
  body('password').isString().isLength({ min: 8 }).custom(password => Buffer.byteLength(password) <= 72)
], async (req, res, next) => {
  if (!validationResult(req).isEmpty()) {
    return res.status(400).json({ message: 'Use a valid reset link and a password of at least 8 characters and at most 72 bytes.' });
  }
  try {
    const { token, password } = req.body;
    const result = await User.updateOne({
      resetTokenHash: hash(token),
      resetExpires: { $gt: new Date() },
      role: 'user'
    }, {
      $set: { password: await bcrypt.hash(password, 10), passwordChangedAt: new Date() },
      $unset: { resetTokenHash: 1, resetExpires: 1 }
    });
    if (!result.modifiedCount) {
      return res.status(400).json({ message: 'This reset link is invalid or has expired.' });
    }
    res.json({ success: true, message: 'Password updated. You can now sign in.' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
