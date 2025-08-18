const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getLawyerAppointments,
  getClientAppointments,
  getUserAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  deleteAppointment
} = require('../controllers/appointmentController');
const { protect } = require('../middlewares/authMiddleware');

// Create new appointment
router.post('/', protect, createAppointment);

// Get all appointments for a lawyer
router.get('/lawyer/:lawyerId', protect, getLawyerAppointments);

// Get all appointments for the current user
router.get('/user', protect, getUserAppointments);

// Get all appointments for a client (user)
router.get('/client/:clientId', protect, getClientAppointments);

// Get appointment by ID
router.get('/:appointmentId', protect, getAppointmentById);

// Update appointment status
router.patch('/:appointmentId/status', protect, updateAppointmentStatus);

// Delete appointment
router.delete('/:appointmentId', protect, deleteAppointment);

module.exports = router;
