const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/lawmate')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Mock transaction data
const mockTransactions = [
  {
    amount: 1500,
    paymentMethod: 'upi',
    description: 'Legal consultation - Family Law',
    status: 'completed'
  },
  {
    amount: 2000,
    paymentMethod: 'bank_transfer',
    description: 'Contract review and advice',
    status: 'completed'
  },
  {
    amount: 1200,
    paymentMethod: 'card',
    description: 'Property law consultation',
    status: 'completed'
  },
  {
    amount: 3000,
    paymentMethod: 'upi',
    description: 'Criminal defense consultation',
    status: 'completed'
  },
  {
    amount: 1800,
    paymentMethod: 'wallet',
    description: 'Corporate law advice',
    status: 'completed'
  },
  {
    amount: 2500,
    paymentMethod: 'bank_transfer',
    description: 'Employment law consultation',
    status: 'completed'
  },
  {
    amount: 1600,
    paymentMethod: 'card',
    description: 'Intellectual property consultation',
    status: 'completed'
  },
  {
    amount: 2200,
    paymentMethod: 'upi',
    description: 'Tax law advice',
    status: 'completed'
  },
  {
    amount: 1900,
    paymentMethod: 'wallet',
    description: 'Real estate consultation',
    status: 'completed'
  },
  {
    amount: 2800,
    paymentMethod: 'bank_transfer',
    description: 'Business law consultation',
    status: 'completed'
  }
];

async function createMockTransactions() {
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

    // Create mock transactions for each lawyer
    for (const lawyer of lawyers) {
      console.log(`Creating transactions for lawyer: ${lawyer.firstName} ${lawyer.lastName}`);
      
      // Create 5-10 transactions per lawyer
      const numTransactions = Math.floor(Math.random() * 6) + 5;
      
      for (let i = 0; i < numTransactions; i++) {
        const mockTransaction = mockTransactions[Math.floor(Math.random() * mockTransactions.length)];
        const client = clients[Math.floor(Math.random() * clients.length)];
        
        const transaction = new Transaction({
          userId: client._id,
          lawyerId: lawyer._id,
          amount: mockTransaction.amount,
          paymentMethod: mockTransaction.paymentMethod,
          description: mockTransaction.description,
          status: mockTransaction.status,
          date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
        });
        
        await transaction.save();
        console.log(`Created transaction: ₹${mockTransaction.amount} from ${client.firstName} ${client.lastName}`);
      }
    }
    
    console.log('Mock transactions created successfully!');
    
  } catch (error) {
    console.error('Error creating mock transactions:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the script
createMockTransactions();
