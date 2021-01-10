const express = require('express');
const { register, login, logout } = require('../controllers/auth');

const router = express.Router();

router.post('/register', register).post('/login', login).get('logout', logout);

module.exports = router;
