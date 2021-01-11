const express = require('express');
const { getUser, getWallet } = require('../controllers/users');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin'), getUser);

router.route('/wallets/:id').get(protect, getWallet);

module.exports = router;
