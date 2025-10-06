const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studio: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Studio',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true // in hours
  },
  totalPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  notes: {
    type: String,
    maxlength: 500
  },
  equipment: [{
    name: String,
    price: Number
  }],
  specialRequests: {
    type: String,
    maxlength: 1000
  }
}, {
  timestamps: true
});

// Index for efficient queries
bookingSchema.index({ date: 1, startTime: 1 });
bookingSchema.index({ user: 1, date: 1 });

module.exports = mongoose.model('Booking', bookingSchema);