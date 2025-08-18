const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  savePaymentDetails,
  getPaymentDetails,
  createTransaction,
  getLawyerTransactions,
  getTransactionStats
} = require('../controllers/paymentController');

// Apply authentication middleware to all routes
router.use(protect);

// Payment Details Routes
router.post('/details', savePaymentDetails); // Save/update lawyer payment details
router.get('/details/:lawyerId', getPaymentDetails); // Get lawyer payment details

// Transaction Routes
router.post('/transaction', createTransaction); // Store a user payment transaction
router.get('/transactions/:lawyerId', getLawyerTransactions); // Get all received payments for lawyer
router.get('/stats/:lawyerId', getTransactionStats); // Get transaction statistics

module.exports = router;
