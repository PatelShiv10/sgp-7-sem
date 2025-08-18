const Review = require('../models/Review');
const User = require('../models/User');

/**
 * Create a new review
 * POST /api/reviews
 */
exports.createReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { lawyerId, rating, comment, appointmentId } = req.body;

    // Validate required fields
    if (!lawyerId || !rating || !comment) {
      return res.status(400).json({
        message: 'Lawyer ID, rating, and comment are required'
      });
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        message: 'Rating must be between 1 and 5'
      });
    }

    // Check if user is trying to review themselves
    if (userId === lawyerId) {
      return res.status(400).json({
        message: 'You cannot review yourself'
      });
    }

    // Check if lawyer exists and is actually a lawyer
    const lawyer = await User.findById(lawyerId);
    if (!lawyer || lawyer.role !== 'lawyer') {
      return res.status(404).json({
        message: 'Lawyer not found'
      });
    }

    // Check if user has already reviewed this lawyer
    const existingReview = await Review.findOne({ userId, lawyerId });
    if (existingReview) {
      return res.status(400).json({
        message: 'You have already reviewed this lawyer'
      });
    }

    // Create new review
    const review = new Review({
      userId,
      lawyerId,
      rating,
      comment,
      appointmentId
    });

    await review.save();

    // Populate user details for response
    await review.populate([
      { path: 'userId', select: 'firstName lastName email' },
      { path: 'lawyerId', select: 'firstName lastName email' }
    ]);

    res.status(201).json({
      message: 'Review created successfully',
      data: review
    });

  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};

/**
 * Get reviews for a specific lawyer
 * GET /api/reviews/lawyer/:lawyerId
 */
exports.getLawyerReviews = async (req, res) => {
  try {
    const { lawyerId } = req.params;
    const { page = 1, limit = 10, rating } = req.query;

    // Validate lawyer exists
    const lawyer = await User.findById(lawyerId);
    if (!lawyer || lawyer.role !== 'lawyer') {
      return res.status(404).json({
        message: 'Lawyer not found'
      });
    }

    // Build query
    let query = { lawyerId };
    if (rating) {
      query.rating = parseInt(rating);
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get reviews with pagination
    const reviews = await Review.find(query)
      .populate([
        { path: 'userId', select: 'firstName lastName email' },
        { path: 'lawyerId', select: 'firstName lastName email' }
      ])
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalReviews = await Review.countDocuments(query);
    const totalPages = Math.ceil(totalReviews / limit);

    // Calculate average rating
    const avgRatingResult = await Review.aggregate([
      { $match: { lawyerId: lawyerId } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);
    const averageRating = avgRatingResult.length > 0 ? avgRatingResult[0].avgRating : 0;

    // Get rating distribution
    const ratingDistribution = await Review.aggregate([
      { $match: { lawyerId: lawyerId } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: -1 } }
    ]);

    res.status(200).json({
      message: 'Reviews retrieved successfully',
      data: {
        reviews,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalReviews,
          limit: parseInt(limit)
        },
        statistics: {
          averageRating: Math.round(averageRating * 10) / 10,
          totalReviews,
          ratingDistribution
        }
      }
    });

  } catch (error) {
    console.error('Error retrieving lawyer reviews:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};

/**
 * Get all reviews (for admin or lawyer dashboard)
 * GET /api/reviews
 */
exports.getAllReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10, lawyerId, rating } = req.query;
    const userId = req.user.id;

    // Build query
    let query = {};
    if (lawyerId) {
      query.lawyerId = lawyerId;
    }
    if (rating) {
      query.rating = parseInt(rating);
    }

    // If user is a lawyer, only show their reviews
    const user = await User.findById(userId);
    if (user && user.role === 'lawyer') {
      query.lawyerId = userId;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get reviews with pagination
    const reviews = await Review.find(query)
      .populate([
        { path: 'userId', select: 'firstName lastName email' },
        { path: 'lawyerId', select: 'firstName lastName email' }
      ])
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalReviews = await Review.countDocuments(query);
    const totalPages = Math.ceil(totalReviews / limit);

    res.status(200).json({
      message: 'Reviews retrieved successfully',
      data: {
        reviews,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalReviews,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error retrieving reviews:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};

/**
 * Update a review (only by the original reviewer)
 * PUT /api/reviews/:reviewId
 */
exports.updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;
    const { rating, comment } = req.body;

    // Find the review
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        message: 'Review not found'
      });
    }

    // Check if user is the original reviewer
    if (review.userId.toString() !== userId) {
      return res.status(403).json({
        message: 'You can only update your own reviews'
      });
    }

    // Update review
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          message: 'Rating must be between 1 and 5'
        });
      }
      review.rating = rating;
    }

    if (comment !== undefined) {
      review.comment = comment;
    }

    await review.save();

    // Populate user details for response
    await review.populate([
      { path: 'userId', select: 'firstName lastName email' },
      { path: 'lawyerId', select: 'firstName lastName email' }
    ]);

    res.status(200).json({
      message: 'Review updated successfully',
      data: review
    });

  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};

/**
 * Delete a review (only by the original reviewer)
 * DELETE /api/reviews/:reviewId
 */
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;

    // Find the review
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        message: 'Review not found'
      });
    }

    // Check if user is the original reviewer
    if (review.userId.toString() !== userId) {
      return res.status(403).json({
        message: 'You can only delete your own reviews'
      });
    }

    await Review.findByIdAndDelete(reviewId);

    res.status(200).json({
      message: 'Review deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};

/**
 * Mark review as helpful
 * POST /api/reviews/:reviewId/helpful
 */
exports.markReviewHelpful = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;
    const { isHelpful = true } = req.body;

    // Find the review
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        message: 'Review not found'
      });
    }

    // Check if user has already voted
    const existingVote = review.helpfulVotes.find(vote => vote.userId.toString() === userId);
    
    if (existingVote) {
      // Update existing vote
      existingVote.isHelpful = isHelpful;
    } else {
      // Add new vote
      review.helpfulVotes.push({
        userId,
        isHelpful
      });
    }

    // Recalculate helpful count
    review.isHelpful = review.helpfulVotes.filter(vote => vote.isHelpful).length;

    await review.save();

    res.status(200).json({
      message: 'Review marked as helpful',
      data: {
        isHelpful: review.isHelpful,
        totalVotes: review.helpfulVotes.length
      }
    });

  } catch (error) {
    console.error('Error marking review helpful:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};
