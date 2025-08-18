const mongoose = require('mongoose');
const Review = require('../models/Review');
const User = require('../models/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/lawmate')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Mock review data
const mockReviews = [
  {
    rating: 5,
    comment: "Excellent lawyer! Very professional and knowledgeable. Helped me resolve my case quickly and efficiently. Highly recommended!",
    isHelpful: 12
  },
  {
    rating: 4,
    comment: "Great communication and fair pricing. The lawyer was very patient and explained everything clearly. Would definitely recommend.",
    isHelpful: 8
  },
  {
    rating: 5,
    comment: "Outstanding legal representation. The lawyer went above and beyond to help with my case. Very responsive and professional.",
    isHelpful: 15
  },
  {
    rating: 4,
    comment: "Very knowledgeable in their field. Provided clear advice and helped me understand the legal process. Good experience overall.",
    isHelpful: 6
  },
  {
    rating: 5,
    comment: "Exceptional service! The lawyer was very thorough and made sure I understood every step. Highly professional and caring.",
    isHelpful: 10
  },
  {
    rating: 3,
    comment: "Decent service but could have been more responsive. The advice was good but communication could be improved.",
    isHelpful: 3
  },
  {
    rating: 5,
    comment: "Amazing lawyer! Very experienced and professional. Helped me win my case and was very supportive throughout the process.",
    isHelpful: 18
  },
  {
    rating: 4,
    comment: "Good legal advice and reasonable fees. The lawyer was professional and helped me understand my options clearly.",
    isHelpful: 7
  }
];

const mockClientNames = [
  { firstName: "John", lastName: "Smith" },
  { firstName: "Sarah", lastName: "Johnson" },
  { firstName: "Mike", lastName: "Wilson" },
  { firstName: "Emily", lastName: "Davis" },
  { firstName: "David", lastName: "Brown" },
  { firstName: "Lisa", lastName: "Garcia" },
  { firstName: "Robert", lastName: "Miller" },
  { firstName: "Maria", lastName: "Martinez" }
];

async function createMockReviews() {
  try {
    // Get all lawyers
    const lawyers = await User.find({ role: 'lawyer' });
    
    if (lawyers.length === 0) {
      console.log('No lawyers found. Please create some lawyers first.');
      return;
    }

    // Get all users (clients)
    const clients = await User.find({ role: 'user' });
    
    if (clients.length === 0) {
      console.log('No clients found. Please create some clients first.');
      return;
    }

    console.log(`Found ${lawyers.length} lawyers and ${clients.length} clients`);

    // Create mock reviews for each lawyer
    for (const lawyer of lawyers) {
      console.log(`Creating reviews for lawyer: ${lawyer.firstName} ${lawyer.lastName}`);
      
      // Create 3-6 reviews per lawyer
      const numReviews = Math.floor(Math.random() * 4) + 3;
      
      for (let i = 0; i < numReviews; i++) {
        const mockReview = mockReviews[Math.floor(Math.random() * mockReviews.length)];
        const client = clients[Math.floor(Math.random() * clients.length)];
        
        // Check if this client has already reviewed this lawyer
        const existingReview = await Review.findOne({
          userId: client._id,
          lawyerId: lawyer._id
        });
        
        if (existingReview) {
          console.log(`Review already exists for ${client.firstName} and ${lawyer.firstName}`);
          continue;
        }
        
        const review = new Review({
          userId: client._id,
          lawyerId: lawyer._id,
          rating: mockReview.rating,
          comment: mockReview.comment,
          isHelpful: mockReview.isHelpful,
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
        });
        
        await review.save();
        console.log(`Created review: ${mockReview.rating} stars from ${client.firstName} ${client.lastName}`);
      }
    }
    
    console.log('Mock reviews created successfully!');
    
  } catch (error) {
    console.error('Error creating mock reviews:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the script
createMockReviews();
