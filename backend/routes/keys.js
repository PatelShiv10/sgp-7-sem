const express = require('express');
const router = express.Router();
const keyController = require('../controllers/keyController');
const { protect } = require('../middlewares/authMiddleware');

// Apply authentication middleware to all key routes
router.use(protect);

// Store a user's public key
router.post('/', keyController.storePublicKey);

// Get a user's public key
router.get('/:userId', keyController.getPublicKey);

// Get multiple users' public keys
router.post('/batch', keyController.getPublicKeysBatch);

// Delete a user's public key
router.delete('/:userId', keyController.deletePublicKey);

module.exports = router;
