const mongoose = require('mongoose');
const PaymentDetails = require('../models/PaymentDetails');
const User = require('../models/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/lawmate')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Mock bank details
const mockBankDetails = [
  {
    bankName: 'State Bank of India',
    accountNumber: '1234567890',
    IFSC: 'SBIN0001234',
    upiId: 'lawyer1@sbicard',
    accountHolderName: 'Adv. John Smith'
  },
  {
    bankName: 'HDFC Bank',
    accountNumber: '9876543210',
    IFSC: 'HDFC0001234',
    upiId: 'lawyer2@hdfcbank',
    accountHolderName: 'Adv. Sarah Johnson'
  },
  {
    bankName: 'ICICI Bank',
    accountNumber: '1122334455',
    IFSC: 'ICIC0001234',
    upiId: 'lawyer3@icici',
    accountHolderName: 'Adv. Mike Wilson'
  },
  {
    bankName: 'Axis Bank',
    accountNumber: '5566778899',
    IFSC: 'UTIB0001234',
    upiId: 'lawyer4@axisbank',
    accountHolderName: 'Adv. Emily Davis'
  },
  {
    bankName: 'Kotak Mahindra Bank',
    accountNumber: '9988776655',
    IFSC: 'KKBK0001234',
    upiId: 'lawyer5@kotak',
    accountHolderName: 'Adv. David Brown'
  }
];

async function createMockPaymentDetails() {
  try {
    // Get all lawyers
    const lawyers = await User.find({ role: 'lawyer' });
    
    if (lawyers.length === 0) {
      console.log('No lawyers found. Please create some lawyers first.');
      return;
    }

    console.log(`Found ${lawyers.length} lawyers`);

    // Create mock payment details for each lawyer
    for (let i = 0; i < lawyers.length; i++) {
      const lawyer = lawyers[i];
      const mockDetails = mockBankDetails[i % mockBankDetails.length];
      
      // Check if payment details already exist
      const existingDetails = await PaymentDetails.findOne({ lawyerId: lawyer._id });
      
      if (existingDetails) {
        console.log(`Payment details already exist for ${lawyer.firstName} ${lawyer.lastName}`);
        continue;
      }
      
      const paymentDetails = new PaymentDetails({
        lawyerId: lawyer._id,
        bankName: mockDetails.bankName,
        accountNumber: mockDetails.accountNumber,
        IFSC: mockDetails.IFSC,
        upiId: mockDetails.upiId,
        accountHolderName: mockDetails.accountHolderName
      });
      
      await paymentDetails.save();
      console.log(`Created payment details for ${lawyer.firstName} ${lawyer.lastName}`);
    }
    
    console.log('Mock payment details created successfully!');
    
  } catch (error) {
    console.error('Error creating mock payment details:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the script
createMockPaymentDetails();
