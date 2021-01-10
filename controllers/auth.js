const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const sendEmail = require('../utils/sendEmail');
const User = require('../models/User');
const Wallet = require('../models/Wallet');

// @desc      Register user
// @route     POST /v1/auth/register
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

// @desc      Login user
// @route     POST /v1/auth/login
// @access    Public
exports.login = asyncHandler(async (req, res, next) => {
	const { email, password } = req.body;

	// Validate emil & password
	if (!email || !password) {
		return next(
			new ErrorResponse('Please provide an email and password', 400)
		);
	}

	// Check for user
	const user = await User.findOne({ email }).select('+password');

	if (!user) {
		return next(new ErrorResponse('Invalid credentials', 401));
	}

	// Check if password matches
	const isMatch = await user.matchPassword(password);

	if (!isMatch) {
		return next(new ErrorResponse('Invalid credentials', 401));
	}
	// check if email is confirmed
	if (!user.isEmailConfirmed) {
		return next(new ErrorResponse('Email not confirmed', 401));
	}
	sendTokenResponse(user, 200, res);
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

// @desc      Log user out / clear cookie
// @route     GET /api/v1/auth/logout
// @access    Public
exports.logout = asyncHandler(async (req, res, next) => {
	res.cookie('token', 'none', {
		expires: new Date(Date.now() + 10 * 1000),
		httpOnly: true,
	});

	res.status(200).json({
		success: true,
		data: {},
	});
});
