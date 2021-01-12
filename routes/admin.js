const express = require('express');
const { adminFund } = require('../controllers/admin');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.post('/fund/:userid', protect, authorize('admin'), adminFund);

module.exports = router;
