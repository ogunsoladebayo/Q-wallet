const express = require('express');
const {
	getUser,
	getWallet,
	getWallets,
	createWallet,
	updateWallet,
} = require('../controllers/users');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin'), getUser);

router
	.route('/wallets')
	.get(protect, authorize('elite'), getWallets)
	.post(protect, authorize('elite'), createWallet);

router
	.route('/wallets/:id')
	.get(protect, getWallet)
	.put(protect, authorize('admin'), updateWallet);

module.exports = router;
