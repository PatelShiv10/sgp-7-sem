const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const reviewController = require('../controllers/reviewController');

// Apply authentication middleware to all routes
router.use(protect);

// Review CRUD routes
router.post('/', reviewController.createReview);
router.get('/', reviewController.getAllReviews);
router.get('/lawyer/:lawyerId', reviewController.getLawyerReviews);
router.put('/:reviewId', reviewController.updateReview);
router.delete('/:reviewId', reviewController.deleteReview);

// Review interaction routes
router.post('/:reviewId/helpful', reviewController.markReviewHelpful);

module.exports = router;
