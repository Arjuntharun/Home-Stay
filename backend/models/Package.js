const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Package name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Package description is required']
  },
  duration: {
    type: String,
    required: [true, 'Package duration is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Package price is required'],
    min: 0
  },
  image: {
    type: String,
    default: ''
  },
  images: [{
    type: String
  }],
  features: [{
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

packageSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Package', packageSchema);

