const asyncHandler = require('../middleware/async');
const Fund = require('../models/Fund');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const converter = require('../utils/converter');
const ErrorResponse = require('../utils/errorResponse');

//  @desc   Admin acess to fund wallet for any user
//  @route  /v1/admin/fund/:userid
//  @access Admin
exports.adminFund = asyncHandler(async (req, res, next) => {
	if (!req.params.userid) {
		return next(new ErrorResponse('fill a user id', 401));
	}
	const { currency, amount } = req.body;
	if (!(currency || amount)) {
		return next(
			new ErrorResponse('Please enter amount and/or currency', 401)
		);
	}

	// get the user
	const user = await User.findById(req.params.userid);
	// check if user is noob
	if (user.role === 'noob') {
		// get wallet
		const wallet = await Wallet.findOne({ user: user.id, isMain: true });
		if (!wallet) {
			return next(new ErrorResponse('No wallet found for user', 404));
		}
		// check if currency are not same
		if (currency !== wallet.currency) {
			// convert to wallet currency
			const newAmount = await converter(
				amount,
				currency,
				wallet.currency
			);
			req.body.amount = newAmount;
		}
		// fund wallet and save
		wallet.balance += req.body.amount;
		await wallet.save({ validateBeforeSave: true });
		res.status(201).json({
			success: true,
			message: 'Wallet funded successful',
			wallet,
		});
	}
	// if user is elite
	else if (user.role === 'elite') {
		// find wallet of requested currency
		let wallet = await Wallet.findOneAndUpdate(
			{
				user: req.params.userid,
				currency: currency,
			},
			{ $inc: { balance: amount } },
			{
				new: true,
				runValidators: true,
			}
		);
		message = 'Wallet funded successfully';

		// check if wallet does not exist for that currency
		if (!wallet) {
			// create the wallet
			wallet = await Wallet.create({
				user: req.params.userid,
				currency: currency,
				balance: amount,
			});
			message = 'New wallet created';
		}

		res.status(201).json({
			success: true,
			message,
			wallet,
		});
	}
});

//  @desc   Admin acess to approve wallet funding for noob user
//  @route  /v1/admin/approve/:fundid
//  @access Admin
exports.approveFund = asyncHandler(async (req, res, next) => {
	if (!req.params.fundid) {
		return next(new ErrorResponse('pass in fund id!', 400));
	}
	// get fund
	const fund = await Fund.findById(req.params.fundid);
	if (!fund) {
		return next(new ErrorResponse('No fund found with this Id', 404));
	}
	// return error if fund is already approved
	if (fund.approvedBy !== 'Not approved') {
		return next(
			new ErrorResponse(
				`Funds already approved by ID: ${fund.approvedBy}`,
				400
			)
		);
	}

	// use fund to update wallet
	const wallet = await Wallet.findByIdAndUpdate(fund.wallet, {
		$inc: { balance: fund.amount },
	});

	// update fund to be "approved"
	(fund.approvedBy = req.user.id), fund.save({ validateBeforeSave: true });

	res.status(200).json({
		success: true,
		message: 'Funds approval successfully, wallet updated.',
		wallet,
	});
});
