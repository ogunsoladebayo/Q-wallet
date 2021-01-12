const express = require('express');
const { adminFund, approveFund } = require('../controllers/admin');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router
	.post('/fund/:userid', protect, authorize('admin'), adminFund)
	.post('/approve/:fundid', protect, authorize('admin'), approveFund);

module.exports = router;
