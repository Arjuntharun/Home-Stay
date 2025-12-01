const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Activity name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Activity description is required']
  },
  price: {
    type: Number,
    required: [true, 'Activity price is required'],
    min: 0
  },
  image: {
    type: String,
    default: ''
  },
  images: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
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

activitySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Activity', activitySchema);

