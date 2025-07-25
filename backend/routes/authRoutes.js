const express = require('express');
const router = express.Router();
const { signupUser, signupLawyer, verifyOtp, loginWithOtp } = require('../controllers/authController');
const { validateUserSignup, validateLawyerSignup } = require('../middlewares/validateSignup');

router.post('/signup/user', validateUserSignup, signupUser);
router.post('/signup/lawyer', validateLawyerSignup, signupLawyer);
router.post('/verify-otp', verifyOtp);
router.post('/login', loginWithOtp);

module.exports = router; 