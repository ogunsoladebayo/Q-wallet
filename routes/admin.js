const express = require('express');
const {
	adminFund,
	approveFund,
	getPending,
	upgrade,
	downgrade,
} = require('../controllers/admin');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router
	.post('/fund/:userid', protect, authorize('admin'), adminFund)
	.post('/approve/:fundid', protect, authorize('admin'), approveFund)
	.get('/pending', protect, authorize('admin'), getPending)
	.put('/upgrade/:userid', protect, authorize('admin'), upgrade)
	.put('/downgrade/:userid', protect, authorize('admin'), downgrade);

module.exports = router;
