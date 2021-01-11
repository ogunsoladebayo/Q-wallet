const express = require('express');
const { getUser, getWallet, getWallets } = require('../controllers/users');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin'), getUser);

router.route('/wallets').get(protect, authorize('elite'), getWallets);

router.route('/wallets/:id').get(protect, getWallet);

module.exports = router;
