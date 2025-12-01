const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  paymentId: {
    type: String,
    unique: true,
    required: true,
    default: function() {
      // Default function that always generates an ID
      const year = new Date().getFullYear();
      const timestamp = Date.now();
      const random = Math.random().toString(36).substr(2, 6).toUpperCase();
      return `PAY${year}${timestamp}-${random}`;
    }
  },
  razorpayOrderId: {
    type: String,
    required: true
  },
  razorpayPaymentId: {
    type: String,
    default: null
  },
  razorpaySignature: {
    type: String,
    default: null
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    default: 'razorpay'
  },
  paymentDate: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Generate unique payment ID before saving (improve the default)
paymentSchema.pre('save', async function(next) {
  try {
    // If paymentId is not set, generate a better one
    if (!this.paymentId || this.paymentId.includes('undefined')) {
      const year = new Date().getFullYear();
      const timestamp = Date.now().toString().slice(-8);
      
      try {
        // Try to get count for better ID format
        const count = await mongoose.model('Payment').countDocuments({
          paymentId: new RegExp(`^PAY${year}`)
        });
        this.paymentId = `PAY${year}${String(count + 1).padStart(6, '0')}-${timestamp}`;
      } catch (countError) {
        // Fallback to timestamp + random
        const random = Math.random().toString(36).substr(2, 6).toUpperCase();
        this.paymentId = `PAY${year}${timestamp}-${random}`;
      }
    }
  } catch (error) {
    console.error('Error in payment ID generation pre-save hook:', error);
    // If all else fails, ensure we have an ID (fallback to default behavior)
    if (!this.paymentId) {
      const year = new Date().getFullYear();
      const timestamp = Date.now();
      const random = Math.random().toString(36).substr(2, 6).toUpperCase();
      this.paymentId = `PAY${year}${timestamp}-${random}`;
    }
  }
  
  // Always call next() to continue
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);

