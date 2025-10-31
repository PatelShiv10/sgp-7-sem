const express = require('express');
const router = express.Router();
const { createOrder, verifyAndCreateBooking } = require('../controllers/paymentController');
const { protect } = require('../middlewares/authMiddleware');

// POST /api/payments/create-order
router.post('/create-order', createOrder);
// POST /api/payments/verify
router.post('/verify', protect, verifyAndCreateBooking);

module.exports = router;


