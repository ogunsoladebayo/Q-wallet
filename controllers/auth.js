const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const User = require('../models/User');
const Wallet = require('../models/Wallet');

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

	const message = `You are receiving this email because you (or someone else) has signed up an account on Q-wallet. Please confirm your email address by clicking the link below. \n ${confirmEmailURL}`;
	try {
		const sendResult = await sendEmail({
			email: user.email,
			subject: 'Confirm Your Email',
			message,
		});

		user.save({ validateBeforeSave: false });
		res.status(200).json({
			success: true,
			message: `confirmation email sent to ${user.email}`,
		});
	} catch (error) {
		user.deleteOne();
		wallet.deleteOne();
		return next(
			new ErrorResponse(
				'Could not send confirmation email, please register again'
			)
		);
	}
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

// @desc      Forgot password
// @route     POST /v1/auth/forgotpassword
// @access    Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
	const user = await User.findOne({ email: req.body.email });

	if (!user) {
		return next(new ErrorResponse('There is no user with that email', 404));
	}

	// Get reset token
	const resetToken = user.getResetPasswordToken();

	await user.save({ validateBeforeSave: false });

	// Create reset url
	const resetUrl = `${req.protocol}://${req.get(
		'host'
	)}/v1/auth/resetpassword?token=${resetToken}`;

	const message = `You are receiving this email because you (or someone else) has requested the reset of your password. Please click this link to proceed: ${resetUrl} otherwise ignore`;

	try {
		await sendEmail({
			email: user.email,
			subject: 'Password Reset',
			message,
		});

		res.status(200).json({
			success: true,
			data: `Password reset email sent to ${user.email}`,
		});
	} catch (err) {
		console.log(err);
		user.resetPasswordToken = undefined;
		user.resetPasswordExpire = undefined;

		await user.save({ validateBeforeSave: false });

		return next(new ErrorResponse('Email could not be sent', 500));
	}
});

// @desc      Reset password
// @route     PUT /v1/auth/resetpassword
// @access    Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
	// Get hashed token
	const { token } = req.query;
	const resetPasswordToken = crypto
		.createHash('sha256')
		.update(token)
		.digest('hex');

	const user = await User.findOne({
		resetPasswordToken,
		resetPasswordExpire: { $gt: Date.now() },
	});

	if (!user) {
		return next(new ErrorResponse('Invalid token', 400));
	}

	// Set new password
	user.password = req.body.password;
	user.resetPasswordToken = undefined;
	user.resetPasswordExpire = undefined;
	await user.save();

	sendTokenResponse(user, 200, res);
});

// @desc      Get current logged in user
// @route     GET /v1/auth/me
// @access    Private
exports.getMe = asyncHandler(async (req, res, next) => {
	// user is already available in req due to the protect middleware
	const user = req.user;
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

// @desc      Update user details
// @route     PUT /v1/auth/updatedetails
// @access    Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
	const fieldsToUpdate = {
		name: req.body.name,
		email: req.body.email,
	};

	const user = await User.findById(req.user.id);

	if (req.body.name) {
		user.name = req.body.name;
	}

	if (req.body.email) {
		user.email = req.body.email;
		user.isEmailConfirmed = false;
		// grab token and send to email
		const confirmEmailToken = user.generateEmailConfirmToken();

		// Create reset url
		const confirmEmailURL = `${req.protocol}://${req.get(
			'host'
		)}/v1/auth/confirmemail?token=${confirmEmailToken}`;

		const message = `You are receiving this email because you (or someone else) has tried to change your account's email address on Q-wallet. Please confirm your email address by clicking the link below. \n ${confirmEmailURL}`;
		try {
			const sendResult = await sendEmail({
				email: user.email,
				subject: 'Confirm Your Email',
				message,
			});

			res.status(200).json({
				success: true,
				message: `confirmation email sent to ${user.email}`,
			});
		} catch (error) {
			user.deleteOne();
			wallet.deleteOne();
			return next(
				new ErrorResponse(
					'Could not send confirmation email, please try again'
				)
			);
		}
	}
	user.save({ validateBeforeSave: false });

	res.status(200).json({
		success: true,
		data: user,
	});
});

// @desc      Update password
// @route     PUT /v1/auth/updatepassword
// @access    Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
	const user = await User.findById(req.user.id).select('+password');

	// Check current password
	if (!(await user.matchPassword(req.body.currentPassword))) {
		return next(new ErrorResponse('Password is incorrect', 401));
	}

	user.password = req.body.newPassword;
	await user.save();

	sendTokenResponse(user, 200, res);
});
