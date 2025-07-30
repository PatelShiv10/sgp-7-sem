const User = require('../models/User');

// Get all lawyers for admin dashboard
exports.getAllLawyers = async (req, res) => {
  try {
    const lawyers = await User.find({ role: 'lawyer' })
      .select('-password -otp -otpExpires')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: lawyers
    });
  } catch (error) {
    console.error('Error fetching lawyers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lawyers'
    });
  }
};

// Get approved lawyers for public display
exports.getApprovedLawyers = async (req, res) => {
  try {
    const lawyers = await User.find({ 
      role: 'lawyer', 
      isVerified: true 
    })
      .select('-password -otp -otpExpires -phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: lawyers
    });
  } catch (error) {
    console.error('Error fetching approved lawyers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lawyers'
    });
  }
};

// Update lawyer status (approve/reject)
exports.updateLawyerStatus = async (req, res) => {
  try {
    const { lawyerId } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be approved, rejected, or pending'
      });
    }

    const lawyer = await User.findByIdAndUpdate(
      lawyerId,
      { 
        status,
        isVerified: status === 'approved' ? true : false
      },
      { new: true }
    ).select('-password -otp -otpExpires');

    if (!lawyer) {
      return res.status(404).json({
        success: false,
        message: 'Lawyer not found'
      });
    }

    res.json({
      success: true,
      message: `Lawyer ${status} successfully`,
      data: lawyer
    });
  } catch (error) {
    console.error('Error updating lawyer status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update lawyer status'
    });
  }
};

// Delete lawyer
exports.deleteLawyer = async (req, res) => {
  try {
    const { lawyerId } = req.params;

    const lawyer = await User.findByIdAndDelete(lawyerId);

    if (!lawyer) {
      return res.status(404).json({
        success: false,
        message: 'Lawyer not found'
      });
    }

    res.json({
      success: true,
      message: 'Lawyer deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting lawyer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete lawyer'
    });
  }
};

// Get lawyer statistics for admin dashboard
exports.getLawyerStats = async (req, res) => {
  try {
    const totalLawyers = await User.countDocuments({ role: 'lawyer' });
    const approvedLawyers = await User.countDocuments({ role: 'lawyer', isVerified: true });
    const pendingLawyers = await User.countDocuments({ role: 'lawyer', isVerified: false });
    const rejectedLawyers = await User.countDocuments({ role: 'lawyer', status: 'rejected' });

    res.json({
      success: true,
      data: {
        totalLawyers,
        approvedLawyers,
        pendingLawyers,
        rejectedLawyers
      }
    });
  } catch (error) {
    console.error('Error fetching lawyer stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lawyer statistics'
    });
  }
}; 