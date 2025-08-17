const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getLawyerAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  deleteAppointment
} = require('../controllers/appointmentController');
const { protect } = require('../middlewares/authMiddleware');

// Create new appointment
router.post('/', protect, createAppointment);

// Get all appointments for a lawyer
router.get('/lawyer/:lawyerId', protect, getLawyerAppointments);

// Get appointment by ID
router.get('/:appointmentId', protect, getAppointmentById);

// Update appointment status
router.patch('/:appointmentId/status', protect, updateAppointmentStatus);

// Delete appointment
router.delete('/:appointmentId', protect, deleteAppointment);

module.exports = router;
