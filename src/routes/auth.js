
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');

router.post('/auth/register', authController.createUser);

router.post('/auth/login', authController.loginUser);

router.post("/auth/forget-password", authController.forgetPassword);

router.post("/auth/reset-password", authController.resetPassword);

module.exports = router;