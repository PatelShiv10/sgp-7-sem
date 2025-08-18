const PaymentDetails = require('../models/PaymentDetails');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

// Save/Update lawyer payment details
exports.savePaymentDetails = async (req, res) => {
  try {
    const { bankName, accountNumber, IFSC, upiId, accountHolderName } = req.body;
    const lawyerId = req.user.id;

    // Validate required fields
    if (!bankName || !accountNumber || !IFSC || !accountHolderName) {
      return res.status(400).json({
        success: false,
        message: 'Bank name, account number, IFSC, and account holder name are required'
      });
    }

    // Check if user is a lawyer
    const user = await User.findById(lawyerId);
    if (!user || user.role !== 'lawyer') {
      return res.status(403).json({
        success: false,
        message: 'Only lawyers can save payment details'
      });
    }

    // Find existing payment details or create new one
    let paymentDetails = await PaymentDetails.findOne({ lawyerId });

    if (paymentDetails) {
      // Update existing details
      paymentDetails.bankName = bankName;
      paymentDetails.accountNumber = accountNumber;
      paymentDetails.IFSC = IFSC;
      paymentDetails.upiId = upiId;
      paymentDetails.accountHolderName = accountHolderName;
      paymentDetails.isActive = true;
    } else {
      // Create new payment details
      paymentDetails = new PaymentDetails({
        lawyerId,
        bankName,
        accountNumber,
        IFSC,
        upiId,
        accountHolderName
      });
    }

    await paymentDetails.save();

    res.status(200).json({
      success: true,
      message: 'Payment details saved successfully',
      data: paymentDetails
    });

  } catch (error) {
    console.error('Error saving payment details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save payment details',
      error: error.message
    });
  }
};

// Get lawyer payment details
exports.getPaymentDetails = async (req, res) => {
  try {
    const { lawyerId } = req.params;

    // Validate lawyerId
    if (!lawyerId) {
      return res.status(400).json({
        success: false,
        message: 'Lawyer ID is required'
      });
    }

    const paymentDetails = await PaymentDetails.findOne({ 
      lawyerId, 
      isActive: true 
    }).populate('lawyerId', 'firstName lastName email');

    if (!paymentDetails) {
      return res.status(404).json({
        success: false,
        message: 'Payment details not found for this lawyer'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment details retrieved successfully',
      data: paymentDetails
    });

  } catch (error) {
    console.error('Error fetching payment details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment details',
      error: error.message
    });
  }
};

// Store a user payment transaction
exports.createTransaction = async (req, res) => {
  try {
    const { lawyerId, amount, paymentMethod, description, appointmentId, notes } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!lawyerId || !amount || !paymentMethod || !description) {
      return res.status(400).json({
        success: false,
        message: 'Lawyer ID, amount, payment method, and description are required'
      });
    }

    // Validate amount
    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0'
      });
    }

    // Check if lawyer exists
    const lawyer = await User.findById(lawyerId);
    if (!lawyer || lawyer.role !== 'lawyer') {
      return res.status(404).json({
        success: false,
        message: 'Lawyer not found'
      });
    }

    // Create new transaction
    const transaction = new Transaction({
      userId,
      lawyerId,
      amount,
      paymentMethod,
      description,
      appointmentId,
      notes,
      status: 'completed' // Assuming immediate completion for demo
    });

    await transaction.save();

    // Populate user and lawyer details
    await transaction.populate([
      { path: 'userId', select: 'firstName lastName email' },
      { path: 'lawyerId', select: 'firstName lastName email' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: transaction
    });

  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create transaction',
      error: error.message
    });
  }
};

// Get all received payments for a lawyer
exports.getLawyerTransactions = async (req, res) => {
  try {
    const { lawyerId } = req.params;
    const { status, startDate, endDate, page = 1, limit = 20 } = req.query;

    // Validate lawyerId
    if (!lawyerId) {
      return res.status(400).json({
        success: false,
        message: 'Lawyer ID is required'
      });
    }

    // Check if lawyer exists
    const lawyer = await User.findById(lawyerId);
    if (!lawyer || lawyer.role !== 'lawyer') {
      return res.status(404).json({
        success: false,
        message: 'Lawyer not found'
      });
    }

    // Build query
    const query = { lawyerId };
    
    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query with pagination
    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .populate('userId', 'firstName lastName email')
        .populate('lawyerId', 'firstName lastName email')
        .populate('appointmentId', 'startsAt endsAt notes')
        .sort({ date: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Transaction.countDocuments(query)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));

    // Calculate total amount
    const totalAmount = await Transaction.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.status(200).json({
      success: true,
      message: 'Transactions retrieved successfully',
      data: {
        transactions,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1,
          limit: parseInt(limit)
        },
        summary: {
          totalAmount: totalAmount[0]?.total || 0,
          totalTransactions: total
        }
      }
    });

  } catch (error) {
    console.error('Error fetching lawyer transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions',
      error: error.message
    });
  }
};

// Get transaction statistics for a lawyer
exports.getTransactionStats = async (req, res) => {
  try {
    const { lawyerId } = req.params;

    if (!lawyerId) {
      return res.status(400).json({
        success: false,
        message: 'Lawyer ID is required'
      });
    }

    // Get current month stats
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const [monthlyStats, totalStats, statusStats] = await Promise.all([
      // Monthly transactions
      Transaction.aggregate([
        {
          $match: {
            lawyerId: lawyerId,
            date: { $gte: currentMonth, $lt: nextMonth },
            status: 'completed'
          }
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' }
          }
        }
      ]),
      // Total transactions
      Transaction.aggregate([
        {
          $match: {
            lawyerId: lawyerId,
            status: 'completed'
          }
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' }
          }
        }
      ]),
      // Status breakdown
      Transaction.aggregate([
        {
          $match: { lawyerId: lawyerId }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' }
          }
        }
      ])
    ]);

    res.status(200).json({
      success: true,
      message: 'Transaction statistics retrieved successfully',
      data: {
        monthly: monthlyStats[0] || { count: 0, totalAmount: 0 },
        total: totalStats[0] || { count: 0, totalAmount: 0 },
        statusBreakdown: statusStats
      }
    });

  } catch (error) {
    console.error('Error fetching transaction stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transaction statistics',
      error: error.message
    });
  }
};
