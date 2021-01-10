const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
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
	const confirmEmailToken = user.generateEmailConfirmToken();

	// Create reset url
	const confirmEmailURL = `${req.protocol}://${req.get(
		'host'
	)}/v1/auth/confirmemail?token=${confirmEmailToken}`;

	const message = `You are receiving this email because you, or someone else has signed up an account on Q-wallet. Please confirm your email address by clicking the link below. \n ${confirmEmailURL}`;

	const sendResult = await sendEmail({
		email: user.email,
		subject: 'Email confirmation token',
		message,
	});

	user.save({ validateBeforeSave: false });
	res.status(200).json({
		success: true,
		message: `confirmation email sent to ${user.email}`,
	});
});

// @desc    Confirm Email
// @route   GET /v1/auth/confirmemail
// @access  Public
exports.confirmEmail = asyncHandler(async (req, res, next) => {
	// grab token from email
	const { token } = req.query;

	if (!token) {
		return next(new ErrorResponse('Invalid Token', 400));
	}

	const splitToken = token.split('.')[0];
	const confirmEmailToken = crypto
		.createHash('sha256')
		.update(splitToken)
		.digest('hex');

	// get user by token
	const user = await User.findOne({
		confirmEmailToken,
		isEmailConfirmed: false,
	});

	if (!user) {
		return next(new ErrorResponse('Invalid Token', 400));
	}

	// update confirmed to true
	user.confirmEmailToken = undefined;
	user.isEmailConfirmed = true;

	// save
	user.save({ validateBeforeSave: false });

	// return token
	sendTokenResponse(user, 200, res);
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
// @route     GET /v1/auth/logout
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
