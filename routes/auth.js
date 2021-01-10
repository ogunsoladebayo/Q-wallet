const express = require('express');
const {
	register,
	login,
	logout,
	confirmEmail,
} = require('../controllers/auth');

const router = express.Router();

router
	.post('/register', register)
	.post('/login', login)
	.get('/logout', logout)
	.get('/confirmemail', confirmEmail);

module.exports = router;
