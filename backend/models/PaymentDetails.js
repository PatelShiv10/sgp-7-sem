const mongoose = require('mongoose');

const paymentDetailsSchema = new mongoose.Schema({
  lawyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  bankName: {
    type: String,
    required: true,
    trim: true
  },
  accountNumber: {
    type: String,
    required: true,
    trim: true
  },
  IFSC: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  upiId: {
    type: String,
    required: false,
    trim: true
  },
  accountHolderName: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
paymentDetailsSchema.index({ lawyerId: 1 });

module.exports = mongoose.model('PaymentDetails', paymentDetailsSchema);
