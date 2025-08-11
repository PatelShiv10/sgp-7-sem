const express = require('express');
const router = express.Router();
const { 
  getAllLawyers, 
  getApprovedLawyers, 
  updateLawyerStatus, 
  deleteLawyer, 
  getLawyerStats,
  getMyProfile,
  updateMyProfile 
} = require('../controllers/lawyerController');
const { protect, admin } = require('../middlewares/authMiddleware');

// Public routes
router.get('/approved', getApprovedLawyers);

// Protected routes for lawyers
router.get('/me', protect, getMyProfile);
router.put('/me', protect, updateMyProfile);

// Protected routes (admin only)
router.get('/all', protect, admin, getAllLawyers);
router.get('/stats', protect, admin, getLawyerStats);
router.put('/:lawyerId/status', protect, admin, updateLawyerStatus);
router.delete('/:lawyerId', protect, admin, deleteLawyer);

module.exports = router; 