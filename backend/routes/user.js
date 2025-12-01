const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');

// @route   GET /api/user/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/user/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, phone } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/user/bookings
// @desc    Get user bookings
// @access  Private
router.get('/bookings', protect, async (req, res) => {
  try {
    console.log('=== Get User Bookings Request ===');
    console.log('User ID:', req.user.id);
    console.log('User ID type:', typeof req.user.id);
    
    // Convert user ID to ObjectId for query
    let userId;
    try {
      if (mongoose.Types.ObjectId.isValid(req.user.id)) {
        userId = new mongoose.Types.ObjectId(req.user.id);
      } else {
        userId = req.user.id;
      }
    } catch (err) {
      userId = req.user.id;
    }
    
    // Find bookings by user ID
    const bookings = await Booking.find({ user: userId })
      .populate('package', 'name price duration image')
      .populate('activities', 'name price')
      .populate('payment', 'paymentId status amount paymentDate')
      .sort({ createdAt: -1 });

    console.log('Found bookings:', bookings.length);
    if (bookings.length > 0) {
      console.log('Sample booking:', {
        bookingId: bookings[0].bookingId,
        userId: bookings[0].user,
        userType: typeof bookings[0].user,
        package: bookings[0].package?.name,
        status: bookings[0].status
      });
    } else {
      console.log('No bookings found for user:', req.user.id);
    }

    res.json({
      success: true,
      count: bookings.length,
      data: { bookings }
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/user/bookings/:id
// @desc    Get single booking
// @access  Private
router.get('/bookings/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user.id
    })
      .populate('package')
      .populate('activities')
      .populate('payment')
      .populate('user', 'name email phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      data: { booking }
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/user/payments
// @desc    Get user payments
// @access  Private
router.get('/payments', protect, async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user.id })
      .populate('booking')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: payments.length,
      data: { payments }
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;

