const mongoose = require('mongoose');

const videoCallSchema = new mongoose.Schema({
  callId: {
    type: String,
    required: true,
    unique: true
  },
  lawyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  status: {
    type: String,
    enum: ['initiated', 'ringing', 'connected', 'ended', 'missed', 'declined'],
    default: 'initiated'
  },
  startTime: {
    type: Date
  },
  endTime: {
    type: Date
  },
  duration: {
    type: Number, // in seconds
    default: 0
  },
  recordingUrl: {
    type: String
  },
  notes: {
    type: String
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

// Update the updatedAt field on save
videoCallSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Index for efficient querying
videoCallSchema.index({ callId: 1 });
videoCallSchema.index({ lawyerId: 1, createdAt: -1 });
videoCallSchema.index({ clientId: 1, createdAt: -1 });
videoCallSchema.index({ status: 1 });

module.exports = mongoose.model('VideoCall', videoCallSchema);
