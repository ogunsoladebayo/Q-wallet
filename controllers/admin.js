const asyncHandler = require('../middleware/async');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const ErrorResponse = require('../utils/errorResponse');

//  @desc   Admin acess to fund wallet for any user
//  @route  /v1/admin/fund
//  @access Admin
exports.adminFund = asyncHandler(async (req, res, next) => {
	if (!req.param.userid) {
		return next(new ErrorResponse('fill a user id', 401));
	}
	const { currency, amount } = req.body;
	if (!(currency || amount)) {
		return next(
			new ErrorResponse('Please enter amount and/or currency', 401)
		);
	}

	// get the user
	const user = await User.findById(req.param.userid);
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
			newAmount = await converter(amount, currency, wallet.currency);
			req.body.amount = newAmount;
		}
		// fund wallet and save
		wallet.balance += req.body.amount;
		await wallet.save({ validateBeforeSave: true });
		res.status(201).json({
			success: true,
			message: 'Wallet funded successfully successful',
			wallet,
		});
	}
	// if user is elite
	else if (user.role === 'elite') {
		// find wallet of requested currency
		let wallet = await Wallet.findOneAndUpdate(
			{
				user: req.param.userid,
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
				user: req.param.userid,
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
