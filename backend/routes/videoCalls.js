const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const videoCallController = require('../controllers/videoCallController');

// Apply authentication middleware to all routes
router.use(protect);

// Video call routes
router.post('/initiate', videoCallController.initiateCall);
router.get('/:callId', videoCallController.getCallDetails);
router.put('/:callId/status', videoCallController.updateCallStatus);
router.post('/:callId/end', videoCallController.endCall);
router.get('/history', videoCallController.getCallHistory);

module.exports = router;
