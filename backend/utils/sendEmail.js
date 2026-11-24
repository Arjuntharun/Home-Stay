const transporter = require('../config/email');

const sendEmail = async (options) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error('Email credentials are not configured');
    }
    const message = {
      from: `${process.env.EMAIL_USER}`,
      to: options.email,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo
    };

    const delivery = await transporter.sendMail(message);
    if (delivery.accepted.length === 0) throw new Error('Email recipient was not accepted');
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = sendEmail;

