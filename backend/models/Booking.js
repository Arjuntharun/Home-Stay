const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    unique: true,
    required: true,
    default: function() {
      // Default function that always generates an ID
      const year = new Date().getFullYear();
      const timestamp = Date.now();
      const random = Math.random().toString(36).substr(2, 6).toUpperCase();
      return `HH${year}-${timestamp}-${random}`;
    }
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  package: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package',
    required: true
  },
  activities: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity'
  }],
  guestDetails: {
    fullName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    }
  },
  checkIn: {
    type: Date,
    required: true
  },
  checkOut: {
    type: Date,
    required: true
  },
  adults: {
    type: Number,
    required: true,
    min: 1
  },
  children: {
    type: Number,
    default: 0
  },
  specialRequests: {
    type: String,
    default: ''
  },
  totalAmount: {
    type: Number,
    required: true
  },
  packageAmount: {
    type: Number,
    required: true
  },
  activitiesAmount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Generate unique booking ID before saving (improve the default)
bookingSchema.pre('save', async function(next) {
  try {
    // If bookingId is not set or is the default simple one, generate a better one
    if (!this.bookingId || this.bookingId.includes('undefined')) {
      const year = new Date().getFullYear();
      const timestamp = Date.now().toString().slice(-8);
      
      try {
        // Try to get count for better ID format
        const count = await mongoose.model('Booking').countDocuments({
          bookingId: new RegExp(`^HH${year}-`)
        });
        this.bookingId = `HH${year}-${String(count + 1).padStart(4, '0')}-${timestamp}`;
      } catch (countError) {
        // Fallback to timestamp + random
        const random = Math.random().toString(36).substr(2, 6).toUpperCase();
        this.bookingId = `HH${year}-${timestamp}-${random}`;
      }
    }
  } catch (error) {
    console.error('Error in booking ID generation pre-save hook:', error);
    // If all else fails, ensure we have an ID (fallback to default behavior)
    if (!this.bookingId) {
      const year = new Date().getFullYear();
      const timestamp = Date.now();
      const random = Math.random().toString(36).substr(2, 6).toUpperCase();
      this.bookingId = `HH${year}-${timestamp}-${random}`;
    }
  }
  
  // Always update updatedAt
  this.updatedAt = Date.now();
  
  // Always call next() to continue
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);

