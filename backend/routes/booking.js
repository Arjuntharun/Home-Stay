const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const { protect } = require('../middleware/auth');
const Booking = require('../models/Booking');
const Package = require('../models/Package');
const Activity = require('../models/Activity');

// @route   POST /api/bookings
// @desc    Create a new booking
// @access  Private
router.post('/', protect, [
  body('package').notEmpty().withMessage('Package is required'),
  body('guestDetails.fullName').notEmpty().withMessage('Full name is required'),
  body('guestDetails.email').isEmail().withMessage('Valid email is required'),
  body('guestDetails.phone').notEmpty().withMessage('Phone number is required'),
  body('checkIn').notEmpty().withMessage('Check-in date is required'),
  body('checkOut').notEmpty().withMessage('Check-out date is required'),
  body('adults').custom((value) => {
    const num = parseInt(value, 10);
    if (!num || isNaN(num) || num < 1) {
      throw new Error('At least 1 adult is required');
    }
    return true;
  })
], async (req, res) => {
  try {
    // Log incoming request for debugging
    console.log('=== Booking Request ===');
    console.log('User ID:', req.user?.id);
    console.log('Request body keys:', Object.keys(req.body));
    console.log('Package ID:', req.body.package);
    console.log('Activities:', req.body.activities);
    console.log('Adults:', req.body.adults);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const {
      package: packageId,
      activities: activityIds = [],
      guestDetails,
      checkIn,
      checkOut,
      adults: adultsInput,
      children: childrenInput = 0,
      specialRequests = ''
    } = req.body;

    // Convert and validate adults
    const adults = parseInt(adultsInput, 10);
    if (!adults || isNaN(adults) || adults < 1) {
      return res.status(400).json({
        success: false,
        message: 'Adults count must be at least 1'
      });
    }

    // Convert and validate children
    const children = parseInt(childrenInput, 10) || 0;

    // Verify package exists
    const packageData = await Package.findById(packageId);
    if (!packageData) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }

    // Validate package has a price
    if (!packageData.price || packageData.price <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Package price is invalid'
      });
    }

    // Calculate amounts
    let packageAmount = packageData.price * adults;
    let activitiesAmount = 0;
    let validActivityIds = [];

    if (activityIds && activityIds.length > 0) {
      // Filter out invalid/empty activity IDs using Mongoose ObjectId validation
      const validIds = activityIds.filter(id => {
        // Check if it's a valid MongoDB ObjectId
        if (!id) return false;
        const idString = String(id).trim();
        return idString.length > 0 && mongoose.Types.ObjectId.isValid(idString);
      }).map(id => {
        try {
          return new mongoose.Types.ObjectId(id);
        } catch (error) {
          return null;
        }
      }).filter(id => id !== null);

      if (validIds.length > 0) {
        // Find only valid and active activities
        const activities = await Activity.find({ 
          _id: { $in: validIds },
          $or: [
            { isActive: true },
            { isActive: { $exists: false } } // Include activities without isActive field
          ]
        });
        
        // Only use activities that were found
        validActivityIds = activities.map(activity => activity._id);
        
        if (validIds.length > activities.length) {
          const missingCount = validIds.length - activities.length;
          console.warn(`Warning: ${missingCount} activity(s) not found or inactive. Proceeding with ${activities.length} valid activity(ies).`);
        }
        
        if (activities.length > 0) {
          activitiesAmount = activities.reduce((sum, activity) => {
            const activityPrice = activity.price || 0;
            return sum + activityPrice;
          }, 0) * adults;
        }
      }
      // If no valid IDs, validActivityIds remains empty array
    }

    const totalAmount = packageAmount + activitiesAmount;

    // Ensure dates are Date objects
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    // Validate dates
    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format'
      });
    }
    
    if (checkOutDate <= checkInDate) {
      return res.status(400).json({
        success: false,
        message: 'Check-out date must be after check-in date'
      });
    }
    
    // Use only valid activity IDs
    const activitiesArray = validActivityIds.length > 0 ? validActivityIds : [];
    
    // Create booking with error handling
    let booking;
    try {
      booking = await Booking.create({
        user: req.user.id,
        package: packageId,
        activities: activitiesArray,
        guestDetails,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        adults,
        children,
        specialRequests: specialRequests || '',
        totalAmount,
        packageAmount,
        activitiesAmount,
        status: 'pending'
      });
    } catch (createError) {
      console.error('Booking creation error:', createError);
      console.error('Booking data:', {
        user: req.user.id,
        package: packageId,
        activitiesCount: activitiesArray.length,
        totalAmount,
        packageAmount,
        activitiesAmount
      });
      
      // Check for duplicate bookingId error
      if (createError.code === 11000 || createError.name === 'MongoServerError') {
        console.error('Duplicate booking ID detected, retrying...');
        // Retry once by waiting a moment for the bookingId to be regenerated
        await new Promise(resolve => setTimeout(resolve, 100));
        booking = await Booking.create({
          user: req.user.id,
          package: packageId,
          activities: activitiesArray,
          guestDetails,
          checkIn: checkInDate,
          checkOut: checkOutDate,
          adults,
          children,
          specialRequests: specialRequests || '',
          totalAmount,
          packageAmount,
          activitiesAmount,
          status: 'pending'
        });
      } else {
        throw createError;
      }
    }

    // Populate booking data
    try {
      await booking.populate('package');
      await booking.populate('activities');
    } catch (populateError) {
      console.error('Error populating booking:', populateError);
      // Continue even if populate fails - booking is still created
    }

    // Note: Email will be sent only after successful payment (in payment verification route)

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: { booking }
    });
  } catch (error) {
    console.error('Create booking error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error name:', error.name);
    console.error('Error code:', error.code);
    console.error('Request body:', JSON.stringify(req.body, null, 2));
    console.error('User ID:', req.user?.id);
    
    // Provide more specific error messages
    let errorMessage = 'Server error';
    if (error.name === 'ValidationError') {
      errorMessage = 'Validation error: ' + Object.values(error.errors).map(e => e.message).join(', ');
    } else if (error.name === 'CastError') {
      errorMessage = 'Invalid data format: ' + error.message;
    } else if (error.code === 11000) {
      errorMessage = 'Duplicate entry detected. Please try again.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// @route   GET /api/bookings/:id
// @desc    Get single booking
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
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

    // Check if user owns the booking or is admin
    if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this booking'
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

// @route   PUT /api/bookings/:id/cancel
// @desc    Cancel a booking
// @access  Private
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user owns the booking or is admin
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: { booking }
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;

