const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');
const { generateOTP, hashOTP } = require('../utils/generateOTP');
const rateLimit = require('../middleware/rateLimit');
const emailTemplates = require('../utils/emailTemplates');

router.use(require('./passwordRecovery'));

// @route   POST /api/auth/register
// @desc    Register a new user and send OTP
// @access  Public
router.post('/register', rateLimit(5, 15 * 60 * 1000), [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isString().trim().toLowerCase().isEmail().withMessage('Please provide a valid email'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('password').isString().isLength({ min: 6 }).custom(password => Buffer.byteLength(password) <= 72).withMessage('Use a password of at least 6 characters and at most 72 bytes')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map(({ path, msg }) => ({ path, msg }))
      });
    }

    const { name, email, phone, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      if (userExists.isEmailVerified) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email'
        });
      }
      return res.status(200).json({
        success: true,
        message: 'Continue verification with your existing code, or request a new code.',
        data: { email: userExists.email, userId: userExists._id }
      });
    }

    // Generate OTP
    const otp = generateOTP();

    // Create user (not verified yet)
    let user;
    try {
      user = await User.create({
        name,
        email,
        phone,
        password,
        otp: hashOTP(email, otp),
        otpAttempts: 0,
        otpExpiry: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
      });
    } catch (createError) {
      console.error('Error creating user:', createError);
      if (createError.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email'
        });
      }
      throw createError;
    }

    // Send OTP email using template
    try {
      const emailHtml = emailTemplates.getOTPEmailTemplate(name, otp);
      await sendEmail({
        email: user.email,
        subject: 'Verify Your Email - Hawkins Homestay',
        html: emailHtml
      });
    } catch (emailError) {
      console.error('Error sending OTP email:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP email'
      });
    }

    res.status(201).json({
      success: true,
      message: 'OTP sent to your email. Please verify to complete registration.',
      data: {
        email: user.email,
        userId: user._id
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP and activate user account
// @access  Public
router.post('/verify-otp', rateLimit(20, 15 * 60 * 1000), [
  body('email').isString().trim().toLowerCase().isEmail().withMessage('Please provide a valid email'),
  body('otp').isString().trim().matches(/^[0-9]{6}$/).withMessage('OTP is required'),
  body('password').isString().isLength({ min: 6 }).custom(password => Buffer.byteLength(password) <= 72).withMessage('Use a password of at least 6 characters and at most 72 bytes')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map(({ path, msg }) => ({ path, msg }))
      });
    }

    const { email, otp, password } = req.body;

    const challenge = {
      email,
      isEmailVerified: false,
      otpExpiry: { $gt: new Date() },
      otpAttempts: { $lt: 5 }
    };
    const digest = hashOTP(email, otp);
    const validCode = await User.exists({ ...challenge, otp: digest });
    const user = validCode && await User.findOneAndUpdate({ ...challenge, otp: digest }, {
      $set: { isEmailVerified: true, password: await bcrypt.hash(password, 10) },
      $unset: { otp: 1, otpExpiry: 1, otpAttempts: 1 }
    });
    if (!user) {
      await User.updateOne({ ...challenge, otp: { $ne: digest } }, { $inc: { otpAttempts: 1 } });
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired code. Request a new code if needed.'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Send welcome email using template
    try {
      const emailHtml = emailTemplates.getWelcomeEmailTemplate(user.name);
      await sendEmail({
        email: user.email,
        subject: 'Welcome to Hawkins Homestay',
        html: emailHtml
      });
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError);
    }

    res.json({
      success: true,
      message: 'Email verified successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   POST /api/auth/resend-otp
// @desc    Resend OTP to user email
// @access  Public
router.post('/resend-otp', rateLimit(5, 15 * 60 * 1000), [
  body('email').isString().trim().toLowerCase().isEmail().withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map(({ path, msg }) => ({ path, msg }))
      });
    }

    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email already verified'
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const now = Date.now();
    const result = await User.updateOne({
      _id: user._id,
      isEmailVerified: false,
      $or: [{ otpExpiry: null }, { otpExpiry: { $lte: new Date(now + 9 * 60 * 1000) } }]
    }, {
      otp: hashOTP(email, otp),
      otpAttempts: 0,
      otpExpiry: new Date(now + 10 * 60 * 1000)
    });
    if (!result.modifiedCount) {
      return res.status(429).json({ success: false, message: 'Wait a minute before requesting another code.' });
    }

    // Send OTP email using template
    try {
      const emailHtml = emailTemplates.getOTPEmailTemplate(user.name, otp);
      await sendEmail({
        email: user.email,
        subject: 'Verify Your Email - Hawkins Homestay',
        html: emailHtml
      });
    } catch (emailError) {
      console.error('Error sending OTP email:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP email'
      });
    }

    res.json({
      success: true,
      message: 'OTP sent to your email'
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', rateLimit(30, 15 * 60 * 1000), [
  body('email').isString().trim().toLowerCase().isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map(({ path, msg }) => ({ path, msg }))
      });
    }

    const { email, password } = req.body;

    // Check if user exists and get password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email first. Check your inbox for OTP.',
        requiresVerification: true
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', require('../middleware/auth').protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('bookings');
    
    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          bookings: user.bookings
        }
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;

