const asyncHandler = require('../middleware/async');
const sendEmail = require('../utils/sendEmail');
const User = require('../models/User');
const Wallet = require('../models/Wallet');

// @desc      Register user
// @route     POST /api/v1/auth/register
// @access    Public
exports.register = asyncHandler(async (req, res, next) => {
	const { name, email, password, currency } = req.body;

	// Create user
	const user = await User.create({
		name,
		email,
		password,
	});

	// Create wallet
	const wallet = await Wallet.create({
		user: user.id,
		currency,
		isMain: true,
	});

	// attach created wallet to new user
	user.wallet = wallet.id;

	// grab token and send to email
	// const confirmEmailToken = user.generateEmailConfirmToken();

	// // Create reset url
	// const confirmEmailURL = `${req.protocol}://${req.get(
	// 	'host'
	// )}/api/v1/auth/confirmemail?token=${confirmEmailToken}`;

	// const message = `You are receiving this email because you need to confirm your email address. Please make a GET request to: \n\n ${confirmEmailURL}`;

	// const sendResult = await sendEmail({
	//     email: user.email,
	// 	subject: 'Email confirmation token',
	// 	message,
	// });

	sendTokenResponse(user, 200, res);
	user.save({ validateBeforeSave: false });
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
	// Create token
	const token = user.getSignedJwtToken();

	const options = {
		expires: new Date(
			Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
		),
		httpOnly: true,
	};

	if (process.env.NODE_ENV === 'production') {
		options.secure = true;
	}

	res.status(statusCode).cookie('token', token, options).json({
		success: true,
		token,
	});
};
