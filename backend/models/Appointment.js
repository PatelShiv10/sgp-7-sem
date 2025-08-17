const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
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
  startsAt: { 
    type: Date, 
    required: true 
  },
  endsAt: { 
    type: Date, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'], 
    default: 'scheduled' 
  },
  notes: { 
    type: String, 
    default: '' 
  },
  meetingType: {
    type: String,
    enum: ['in-person', 'video-call', 'phone-call'],
    default: 'video-call'
  },
  location: {
    type: String,
    default: ''
  },
  meetingLink: {
    type: String,
    default: ''
  }
}, { 
  timestamps: true 
});

// Index for efficient queries
appointmentSchema.index({ lawyerId: 1, startsAt: 1 });
appointmentSchema.index({ clientId: 1, startsAt: 1 });
appointmentSchema.index({ status: 1 });

// Virtual for duration in minutes
appointmentSchema.virtual('durationMinutes').get(function() {
  return Math.round((this.endsAt - this.startsAt) / (1000 * 60));
});

// Ensure virtuals are serialized
appointmentSchema.set('toJSON', { virtuals: true });
appointmentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
