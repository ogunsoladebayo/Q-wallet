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

// @desc      Get all user wallets
// @route     GET /v1/users/wallets
// @access    Elite
exports.getWallets = asyncHandler(async (req, res, next) => {
	const other_wallets = await Wallet.find({
		user: req.user.id,
		isMain: false,
	});

	res.status(200).json({
		success: true,
		other_wallets,
	});
});

// @desc      Create wallet
// @route     POST /v1/users/wallets
// @access    Private/Admin
exports.createWallet = asyncHandler(async (req, res, next) => {
	// user id to associated to new wallet gotten from auth middleware
	req.body.user = req.user.id;

	// check if currency already exists
	const currencyExists = await Wallet.findOne({
		user: req.user.id,
		currency: req.body.currency,
	});

	if (currencyExists) {
		return next(
			new ErrorResponse('Cannot have two wallets with same currency', 401)
		);
	}

	const wallet = await Wallet.create(req.body);

	res.status(201).json({
		success: true,
		data: wallet,
	});
});

// @desc      Update wallet
// @route     PUT /v1/users/wallets/byuserid/:id
// @access    Admin
exports.updateWallet = asyncHandler(async (req, res, next) => {
	if (!req.body.currency) {
		return next(new ErrorResponse('Please provide a currency', 400));
	}
	const { userid, walletid } = req.query;

	// get wallet based on endpoint used
	let wallet;
	let currencyExists;

	if (userid) {
		wallet = await Wallet.findOne({
			user: userid,
			isMain: true,
		});
		// check if currency already exists
		currencyExists = await Wallet.findOne({
			user: userid,
			currency: req.body.currency,
		});
	} else if (walletid) {
		wallet = await Wallet.findById(walletid);
		// check if currency already exists
		currencyExists = await Wallet.findOne({
			user: wallet.user,
			currency: req.body.currency,
		});
	}

	// if wallet not found
	if (!wallet) {
		return next(new ErrorResponse('Wallet not found', 404));
	}

	// get current currency and balance
	const currentCurrency = wallet.currency;
	const currentBalance = wallet.balance;

	// new currency
	const newCurrency = req.body.currency;

	try {
		// Convert current balance to new balance in new currency
		const conversionString = `${currentCurrency}_${newCurrency}`;
		await axios
			.get(
				`https://free.currconv.com/api/v7/convert?q=${conversionString}&compact=ultra&apiKey=${process.env.CURRCONV_API_KEY}`
			)
			.then((response) => {
				data = JSON.stringify(response.data);
				const rate = data.match(/[\d|,|.|e|E|\+]+/g)[0];

				// Update wallet balance and currency to new, then save
				wallet.currency = newCurrency;
				wallet.balance = currentBalance * rate;
				wallet.isMain = !!userid;
				if (currencyExists && currencyExists.id != wallet.id) {
					wallet.balance += currencyExists.balance;
					wallet.id = currencyExists.id;
					currencyExists.delete();
				}
				wallet.save({ validateBeforeSave: true });
			});
	} catch (error) {
		return next(
			new ErrorResponse(
				'Unable to change currency, please try again',
				500
			)
		);
	}

	res.status(200).json({
		success: true,
		data: wallet,
	});
});

// @desc      Delete wallet
// @route     DELETE /v1/users/wallets/:id
// @access    Private/Admin
exports.deleteWallet = asyncHandler(async (req, res, next) => {
	const wallet = await Wallet.findById(req.params.id);

	// check wallet is not main before delete
	if (wallet.isMain) {
		return next(new ErrorResponse('Error! cannot delete main wallet'), 400);
	}

	// check wallet is empty before delete
	if (wallet.balance > 0) {
		return next(new ErrorResponse('Error! wallet not empty'), 400);
	}
	await wallet.delete();

	res.status(200).json({
		success: true,
		data: {},
	});
});
