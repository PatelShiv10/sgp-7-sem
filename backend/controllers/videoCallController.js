const VideoCall = require('../models/VideoCall');
const User = require('../models/User');

/**
 * Initiate a video call
 * POST /api/video-calls/initiate
 */
exports.initiateCall = async (req, res) => {
  try {
    const { lawyerId, clientId, appointmentId } = req.body;
    const callerId = req.user.id;

    // Validate required fields
    if (!lawyerId || !clientId) {
      return res.status(400).json({
        message: 'Lawyer ID and client ID are required'
      });
    }

    // Check if caller is either lawyer or client
    if (callerId !== lawyerId && callerId !== clientId) {
      return res.status(403).json({
        message: 'You can only initiate calls where you are a participant'
      });
    }

    // Check if participants exist
    const lawyer = await User.findById(lawyerId);
    const client = await User.findById(clientId);

    if (!lawyer || lawyer.role !== 'lawyer') {
      return res.status(404).json({
        message: 'Lawyer not found'
      });
    }

    if (!client) {
      return res.status(404).json({
        message: 'Client not found'
      });
    }

    // Generate unique call ID
    const callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create video call record
    const videoCall = new VideoCall({
      callId,
      lawyerId,
      clientId,
      appointmentId,
      status: 'initiated'
    });

    await videoCall.save();

    res.status(201).json({
      message: 'Video call initiated successfully',
      data: {
        callId,
        status: videoCall.status,
        participants: {
          lawyer: {
            id: lawyer._id,
            name: `${lawyer.firstName} ${lawyer.lastName}`,
            email: lawyer.email
          },
          client: {
            id: client._id,
            name: `${client.firstName} ${client.lastName}`,
            email: client.email
          }
        }
      }
    });

  } catch (error) {
    console.error('Error initiating video call:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};

/**
 * Get call details
 * GET /api/video-calls/:callId
 */
exports.getCallDetails = async (req, res) => {
  try {
    const { callId } = req.params;
    const userId = req.user.id;

    const videoCall = await VideoCall.findOne({ callId })
      .populate([
        { path: 'lawyerId', select: 'firstName lastName email' },
        { path: 'clientId', select: 'firstName lastName email' }
      ]);

    if (!videoCall) {
      return res.status(404).json({
        message: 'Video call not found'
      });
    }

    // Check if user is a participant
    if (videoCall.lawyerId._id.toString() !== userId && 
        videoCall.clientId._id.toString() !== userId) {
      return res.status(403).json({
        message: 'You are not authorized to view this call'
      });
    }

    res.status(200).json({
      message: 'Call details retrieved successfully',
      data: videoCall
    });

  } catch (error) {
    console.error('Error retrieving call details:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};

/**
 * Update call status
 * PUT /api/video-calls/:callId/status
 */
exports.updateCallStatus = async (req, res) => {
  try {
    const { callId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    const videoCall = await VideoCall.findOne({ callId });

    if (!videoCall) {
      return res.status(404).json({
        message: 'Video call not found'
      });
    }

    // Check if user is a participant
    if (videoCall.lawyerId.toString() !== userId && 
        videoCall.clientId.toString() !== userId) {
      return res.status(403).json({
        message: 'You are not authorized to update this call'
      });
    }

    // Update status and timing
    videoCall.status = status;

    if (status === 'connected' && !videoCall.startTime) {
      videoCall.startTime = new Date();
    } else if (['ended', 'missed', 'declined'].includes(status) && !videoCall.endTime) {
      videoCall.endTime = new Date();
      if (videoCall.startTime) {
        videoCall.duration = Math.floor((videoCall.endTime - videoCall.startTime) / 1000);
      }
    }

    await videoCall.save();

    res.status(200).json({
      message: 'Call status updated successfully',
      data: {
        callId,
        status: videoCall.status,
        startTime: videoCall.startTime,
        endTime: videoCall.endTime,
        duration: videoCall.duration
      }
    });

  } catch (error) {
    console.error('Error updating call status:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};

/**
 * Get user's call history
 * GET /api/video-calls/history
 */
exports.getCallHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    // Build query
    let query = {
      $or: [
        { lawyerId: userId },
        { clientId: userId }
      ]
    };

    if (status) {
      query.status = status;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get calls with pagination
    const calls = await VideoCall.find(query)
      .populate([
        { path: 'lawyerId', select: 'firstName lastName email' },
        { path: 'clientId', select: 'firstName lastName email' }
      ])
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalCalls = await VideoCall.countDocuments(query);
    const totalPages = Math.ceil(totalCalls / limit);

    res.status(200).json({
      message: 'Call history retrieved successfully',
      data: {
        calls,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCalls,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error retrieving call history:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};

/**
 * End a call
 * POST /api/video-calls/:callId/end
 */
exports.endCall = async (req, res) => {
  try {
    const { callId } = req.params;
    const userId = req.user.id;

    const videoCall = await VideoCall.findOne({ callId });

    if (!videoCall) {
      return res.status(404).json({
        message: 'Video call not found'
      });
    }

    // Check if user is a participant
    if (videoCall.lawyerId.toString() !== userId && 
        videoCall.clientId.toString() !== userId) {
      return res.status(403).json({
        message: 'You are not authorized to end this call'
      });
    }

    // Update call status
    videoCall.status = 'ended';
    videoCall.endTime = new Date();
    
    if (videoCall.startTime) {
      videoCall.duration = Math.floor((videoCall.endTime - videoCall.startTime) / 1000);
    }

    await videoCall.save();

    res.status(200).json({
      message: 'Call ended successfully',
      data: {
        callId,
        status: videoCall.status,
        duration: videoCall.duration,
        endTime: videoCall.endTime
      }
    });

  } catch (error) {
    console.error('Error ending call:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};
