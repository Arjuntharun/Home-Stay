const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { protect } = require('../middleware/auth');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const sendEmail = require('../utils/sendEmail');
const emailTemplates = require('../utils/emailTemplates');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @route   POST /api/payments/create-order
// @desc    Create Razorpay order
// @access  Private
router.post('/create-order', protect, async (req, res) => {
  try {
    console.log('=== Create Payment Order Request ===');
    console.log('User ID:', req.user?.id);
    console.log('Request body:', req.body);
    
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID is required'
      });
    }

    const booking = await Booking.findById(bookingId)
      .populate('package')
      .populate('user');

    if (!booking) {
      console.error('Booking not found:', bookingId);
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    console.log('Booking found:', {
      bookingId: booking.bookingId,
      totalAmount: booking.totalAmount,
      userId: booking.user?._id,
      package: booking.package?.name
    });

    // Check if user owns the booking
    if (!booking.user || booking.user._id.toString() !== req.user.id) {
      console.error('Authorization failed:', {
        bookingUserId: booking.user?._id?.toString(),
        requestUserId: req.user.id
      });
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Validate booking has totalAmount
    if (!booking.totalAmount || booking.totalAmount <= 0) {
      console.error('Invalid booking amount:', booking.totalAmount);
      return res.status(400).json({
        success: false,
        message: 'Invalid booking amount'
      });
    }

    // Check if payment already exists
    let payment = await Payment.findOne({ booking: bookingId });

    if (payment && payment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Payment already completed for this booking'
      });
    }

    // Validate Razorpay credentials
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('Razorpay credentials not configured');
      return res.status(500).json({
        success: false,
        message: 'Payment gateway not configured'
      });
    }

    // Create Razorpay order
    const amountInPaise = Math.round(booking.totalAmount * 100); // Ensure integer
    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: booking.bookingId || `booking-${bookingId}`,
      notes: {
        bookingId: booking.bookingId || bookingId,
        userId: req.user.id.toString()
      }
    };

    console.log('Creating Razorpay order with options:', {
      amount: options.amount,
      currency: options.currency,
      receipt: options.receipt
    });

    let razorpayOrder;
    try {
      razorpayOrder = await razorpay.orders.create(options);
      console.log('Razorpay order created:', razorpayOrder.id);
    } catch (razorpayError) {
      console.error('Razorpay API error:', razorpayError);
      console.error('Razorpay error details:', {
        message: razorpayError.message,
        statusCode: razorpayError.statusCode,
        error: razorpayError.error
      });
      return res.status(500).json({
        success: false,
        message: 'Failed to create payment order',
        error: razorpayError.message || 'Razorpay API error'
      });
    }

    // Create or update payment record
    if (payment) {
      payment.razorpayOrderId = razorpayOrder.id;
      payment.amount = booking.totalAmount;
      await payment.save();
    } else {
      payment = await Payment.create({
        razorpayOrderId: razorpayOrder.id,
        booking: bookingId,
        user: req.user.id,
        amount: booking.totalAmount
      });
    }

    res.json({
      success: true,
      data: {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: process.env.RAZORPAY_KEY_ID
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error name:', error.name);
    console.error('Error code:', error.code);
    
    // Provide more specific error messages
    let errorMessage = 'Server error';
    if (error.name === 'ValidationError') {
      errorMessage = 'Validation error: ' + Object.values(error.errors).map(e => e.message).join(', ');
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

// @route   POST /api/payments/verify
// @desc    Verify Razorpay payment
// @access  Private
router.post('/verify', protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    // Verify signature
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

    // Update payment record
    const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found'
      });
    }

    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.status = 'completed';
    payment.paymentDate = new Date();
    await payment.save();

    // Update booking status
    const booking = await Booking.findById(bookingId)
      .populate('package')
      .populate('user')
      .populate('activities');
    
    if (booking) {
      booking.status = 'confirmed';
      booking.payment = payment._id;
      await booking.save();
      
      // Send payment confirmation email with complete booking details using template
      try {
        const emailHtml = emailTemplates.getPaymentConfirmationTemplate(
          booking,
          payment,
          booking.package,
          booking.activities || []
        );
        
        await sendEmail({
          email: booking.guestDetails.email,
          subject: 'Booking Confirmed - Payment Successful | Hawkins Homestay',
          html: emailHtml
        });
        
        console.log('Payment confirmation email sent successfully to:', booking.guestDetails.email);
      } catch (emailError) {
        console.error('Error sending payment confirmation email:', emailError);
        // Don't fail the payment verification if email fails
      }
    }

    res.json({
      success: true,
      message: 'Payment verified and completed successfully',
      data: { payment, booking }
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/payments/:id
// @desc    Get payment details
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('booking')
      .populate('user', 'name email phone');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check if user owns the payment or is admin
    if (payment.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this payment'
      });
    }

    res.json({
      success: true,
      data: { payment }
    });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;

