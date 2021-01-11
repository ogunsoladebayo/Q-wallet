const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Wallet = require('../models/Wallet');
const User = require('../models/User');
const axios = require('axios').default;

// @desc      Get a user
// @route     GET /v1/users/:id
// @access    Admin
exports.getUser = asyncHandler(async (req, res, next) => {
	if (!req.body.email) {
		return next(new ErrorResponse('Please specify an email address', 400));
	}

	const user = await User.findOne({ email: req.body.email });
	const mainWallet = await Wallet.findById(user.wallet);
	const { name, email, role, _id, isEmailConfirmed } = user;
	const data = {
		name,
		email,
		role,
		id: _id,
		isEmailConfirmed,
		mainWallet,
	};
	// get other wallets if user is elite
	if (user.role === 'elite') {
		const secondaryWallets = await Wallet.find({
			user: user.id,
			isMain: false,
		});
		data.secondaryWallets = secondaryWallets;
	}

	res.status(200).json({
		success: true,
		user: data,
	});
});

// @desc      Get single wallet
// @route     GET /v1/users/wallets/:id
// @access    Private/Admin
exports.getWallet = asyncHandler(async (req, res, next) => {
	const wallet = await Wallet.findById(req.params.id);
	if (!req.params.id) {
		return next(new ErrorResponse('Please enter a wallet id', 400));
	}

	if (wallet.user != req.user.id && req.user.role != 'admin') {
		return next(
			new ErrorResponse('Not authorized to view this wallet', 401)
		);
	}

	res.status(200).json({
		success: true,
		data: wallet,
	});
});
