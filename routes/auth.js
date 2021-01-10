const express = require('express');
const {
	register,
	login,
	logout,
	confirmEmail,
	forgotPassword,
	resetPassword,
} = require('../controllers/auth');

const router = express.Router();

router
	.post('/register', register)
	.post('/login', login)
	.get('/logout', logout)
	.get('/confirmemail', confirmEmail)
	.post('/forgotpassword', forgotPassword)
	.put('/resetpassword', resetPassword);

module.exports = router;
