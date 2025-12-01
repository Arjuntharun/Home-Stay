const transporter = require('../config/email');

const sendEmail = async (options) => {
  try {
    const message = {
      from: `${process.env.EMAIL_USER}`,
      to: options.email,
      subject: options.subject,
      html: options.html
    };

    await transporter.sendMail(message);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = sendEmail;

