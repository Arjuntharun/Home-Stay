const express = require('express');
const { body, validationResult } = require('express-validator');
const sendEmail = require('../utils/sendEmail');
const rateLimit = require('../middleware/rateLimit');

const router = express.Router();

router.post('/', rateLimit(5, 15 * 60 * 1000), [
  body('firstName').isString().trim().isLength({ min: 2, max: 80 }),
  body('lastName').isString().trim().isLength({ min: 2, max: 80 }),
  body('email').isEmail().isLength({ max: 254 }),
  body('phone').optional({ values: 'falsy' }).isString().trim().isLength({ max: 40 }),
  body('subject').isString().trim().isLength({ min: 1, max: 100 }),
  body('message').isString().trim().isLength({ min: 10, max: 4000 })
], async (req, res) => {
  if (!validationResult(req).isEmpty()) {
    return res.status(400).json({ message: 'Check your contact details and message.' });
  }

  const inbox = process.env.INQUIRY_EMAIL || process.env.EMAIL_USER;
  if (!inbox) return res.status(503).json({ message: 'Inquiries are temporarily unavailable.' });

  const { firstName, lastName, email, phone, subject, message } = req.body;
  try {
    await sendEmail({
      email: inbox,
      replyTo: email,
      subject: 'Hawkins Homestay website inquiry',
      text: [firstName + ' ' + lastName, email, phone, subject, '', message].join('\n')
    });
    res.json({ success: true, message: 'Your inquiry was sent.' });
  } catch {
    res.status(503).json({ message: 'Your inquiry could not be sent. Please try again.' });
  }
});

module.exports = router;
