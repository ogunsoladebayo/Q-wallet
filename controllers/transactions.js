const asyncHandler = require('../middleware/async');
const Fund = require('../models/Fund');
const Wallet = require('../models/Wallet');
const converter = require('../utils/converter');
const ErrorResponse = require('../utils/errorResponse');

//  @desc   Fund wallet for any user
//  @route  /v1/transactions/funding
//  @access Noob/Elite/Admin
exports.fundWallet = asyncHandler(async (req, res, next) => {
	const { currency, amount } = req.body;
	// check if noob
	if (req.user.role === 'noob') {
		req.body.user = req.user.id;
		// get the wallet
		const wallet = await Wallet.findOne({
			user: req.body.user,
			isMain: true,
		});
		if (!wallet) {
			return next(new ErrorResponse('No wallet found for user', 404));
		}
		// check if currency are not same
		if (currency !== wallet.currency) {
			// convert to wallet currency
			newAmount = await converter(amount, currency, wallet.currency);
			req.body.currency = wallet.currency;
			req.body.amount = newAmount;
		}

		// update fund schema instead of applying fund directly
		const fund = await Fund.create(req.body);

		res.status(201).json({
			success: true,
			message: 'Funds recieved, awaiting approval',
			data: fund,
		});
	}
	//if user is elite
	else if (req.user.role === 'elite') {
		// find wallet of requested currency
		let wallet = await Wallet.findOneAndUpdate(
			{
				user: req.user.id,
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
				user: req.user.id,
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
