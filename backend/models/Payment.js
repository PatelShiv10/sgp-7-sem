const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  lawyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Bank/Payment Details
  bankDetails: {
    accountHolderName: {
      type: String,
      required: true
    },
    accountNumber: {
      type: String,
      required: true
    },
    ifscCode: {
      type: String,
      required: true
    },
    bankName: {
      type: String,
      required: true
    },
    branchName: {
      type: String,
      required: true
    }
  },
  // Transaction History
  transactions: [{
    transactionId: {
      type: String,
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
      enum: ['online', 'bank_transfer', 'upi', 'card'],
      required: true
    },
    description: {
      type: String,
      required: true
    },
    clientName: {
      type: String,
      required: true
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment'
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    completedAt: {
      type: Date
    }
  }],
  // Payment Settings
  paymentSettings: {
    consultationFee: {
      type: Number,
      default: 1000
    },
    isActive: {
      type: Boolean,
      default: true
    },
    autoAccept: {
      type: Boolean,
      default: false
    }
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
paymentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Index for efficient querying
paymentSchema.index({ lawyerId: 1 });
paymentSchema.index({ 'transactions.transactionId': 1 });

module.exports = mongoose.model('Payment', paymentSchema);
