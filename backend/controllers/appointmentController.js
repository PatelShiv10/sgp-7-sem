const Appointment = require('../models/Appointment');
const User = require('../models/User');

// Create a new appointment
exports.createAppointment = async (req, res) => {
  try {
    const { lawyerId, clientId, startsAt, endsAt, status, notes, meetingType, location, meetingLink } = req.body;
    
    // Validate required fields
    if (!lawyerId || !clientId || !startsAt || !endsAt) {
      return res.status(400).json({
        success: false,
        message: 'lawyerId, clientId, startsAt, and endsAt are required'
      });
    }

    // Validate dates
    const startDate = new Date(startsAt);
    const endDate = new Date(endsAt);
    const now = new Date();

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format for startsAt or endsAt'
      });
    }

    if (startDate <= now) {
      return res.status(400).json({
        success: false,
        message: 'Appointment start time must be in the future'
      });
    }

    if (endDate <= startDate) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time'
      });
    }

    // Validate users exist and have correct roles
    const [lawyer, client] = await Promise.all([
      User.findById(lawyerId).select('role isVerified'),
      User.findById(clientId).select('role')
    ]);

    if (!lawyer || lawyer.role !== 'lawyer' || !lawyer.isVerified) {
      return res.status(404).json({
        success: false,
        message: 'Lawyer not found or not verified'
      });
    }

    if (!client || client.role !== 'client') {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    // Check for scheduling conflicts
    const conflictingAppointment = await Appointment.findOne({
      lawyerId,
      status: { $in: ['scheduled', 'confirmed'] },
      $or: [
        {
          startsAt: { $lt: endDate },
          endsAt: { $gt: startDate }
        }
      ]
    });

    if (conflictingAppointment) {
      return res.status(409).json({
        success: false,
        message: 'This time slot conflicts with an existing appointment'
      });
    }

    // Create the appointment
    const appointment = new Appointment({
      lawyerId,
      clientId,
      startsAt: startDate,
      endsAt: endDate,
      status: status || 'scheduled',
      notes: notes || '',
      meetingType: meetingType || 'video-call',
      location: location || '',
      meetingLink: meetingLink || ''
    });

    await appointment.save();

    // Populate user details for response
    await appointment.populate([
      { path: 'lawyerId', select: 'firstName lastName email' },
      { path: 'clientId', select: 'firstName lastName email' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: appointment
    });

  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create appointment',
      error: error.message
    });
  }
};

// Get all appointments for a lawyer
exports.getLawyerAppointments = async (req, res) => {
  try {
    const { lawyerId } = req.params;
    const { status, startDate, endDate, page = 1, limit = 20 } = req.query;

    // Validate lawyer exists
    const lawyer = await User.findById(lawyerId).select('role isVerified');
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
      query.startsAt = {};
      if (startDate) {
        query.startsAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.startsAt.$lte = new Date(endDate);
      }
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute query with pagination
    const [appointments, total] = await Promise.all([
      Appointment.find(query)
        .populate('lawyerId', 'firstName lastName email')
        .populate('clientId', 'firstName lastName email')
        .sort({ startsAt: 1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Appointment.countDocuments(query)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    res.json({
      success: true,
      message: 'Appointments retrieved successfully',
      data: {
        appointments,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          hasNextPage,
          hasPrevPage,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching lawyer appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments',
      error: error.message
    });
  }
};

// Get all appointments for the current user
exports.getUserAppointments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 20 } = req.query;

    // Build query
    const query = { clientId: userId };
    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [appointments, total] = await Promise.all([
      Appointment.find(query)
        .populate('lawyerId', 'firstName lastName email specialization')
        .populate('clientId', 'firstName lastName email')
        .sort({ startsAt: 1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Appointment.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      message: 'User appointments retrieved successfully',
      data: {
        appointments,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching user appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments',
      error: error.message
    });
  }
};

// Get all appointments for a client (user)
exports.getClientAppointments = async (req, res) => {
  try {
    const { clientId } = req.params;
    const { status, startDate, endDate, page = 1, limit = 20 } = req.query;

    // Validate client exists
    const client = await User.findById(clientId).select('role');
    if (!client || client.role !== 'user') {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    // Build query
    const query = { clientId };
    if (status) {
      query.status = status;
    }
    if (startDate || endDate) {
      query.startsAt = {};
      if (startDate) query.startsAt.$gte = new Date(startDate);
      if (endDate) query.startsAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [appointments, total] = await Promise.all([
      Appointment.find(query)
        .populate('lawyerId', 'firstName lastName email')
        .populate('clientId', 'firstName lastName email')
        .sort({ startsAt: 1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Appointment.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      message: 'Client appointments retrieved successfully',
      data: {
        appointments,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching client appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments',
      error: error.message
    });
  }
};

// Get appointment by ID
exports.getAppointmentById = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await Appointment.findById(appointmentId)
      .populate('lawyerId', 'firstName lastName email')
      .populate('clientId', 'firstName lastName email');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.json({
      success: true,
      message: 'Appointment retrieved successfully',
      data: appointment
    });

  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointment',
      error: error.message
    });
  }
};

// Update appointment status
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const validStatuses = ['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { status },
      { new: true, runValidators: true }
    ).populate([
      { path: 'lawyerId', select: 'firstName lastName email' },
      { path: 'clientId', select: 'firstName lastName email' }
    ]);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.json({
      success: true,
      message: 'Appointment status updated successfully',
      data: appointment
    });

  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update appointment status',
      error: error.message
    });
  }
};

// Delete appointment
exports.deleteAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await Appointment.findByIdAndDelete(appointmentId);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.json({
      success: true,
      message: 'Appointment deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete appointment',
      error: error.message
    });
  }
};
