const express = require('express');
const {
	fundWallet,
	withdrawFromWallet,
} = require('../controllers/transactions');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.post('/fund', protect, authorize('noob', 'elite'), fundWallet);

module.exports = router;
