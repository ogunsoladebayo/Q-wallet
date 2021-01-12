const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'Please add a name'],
	},
	email: {
		type: String,
		required: [true, 'Please add an email'],
		unique: true,
		match: [
			/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
			'Please add a valid email',
		],
	},
	role: {
		type: String,
		enum: ['noob', 'elite', 'admin'],
		default: 'noob',
	},
	wallet: {
		type: mongoose.Schema.ObjectId,
		ref: 'Wallet',
		required: false,
	},
	password: {
		type: String,
		required: [true, 'Please add a password'],
		minlength: 8,
		match: [
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/,
			'Password must be a minimum of 8 characters long and must have at least one uppercase and a lower case.',
		],
		select: false,
	},
	resetPasswordToken: String,
	resetPasswordExpire: Date,
	confirmEmailToken: String,
	isEmailConfirmed: {
		type: Boolean,
		default: false,
	},
	twoFactorCode: String,
	twoFactorCodeExpire: Date,
	twoFactorEnable: {
		type: Boolean,
		default: false,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	modifiedAt: Date,
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function (next) {
	this.modifiedAt = Date.now();
	if (!this.isModified('password')) {
		next();
	}

	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
	return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRE,
	});
};

// Generate email confirm token
UserSchema.methods.generateEmailConfirmToken = function (next) {
	// email confirmation token
	const confirmationToken = crypto.randomBytes(20).toString('hex');

	this.confirmEmailToken = crypto
		.createHash('sha256')
		.update(confirmationToken)
		.digest('hex');

	const confirmTokenExtend = crypto.randomBytes(100).toString('hex');
	const confirmTokenCombined = `${confirmationToken}.${confirmTokenExtend}`;
	return confirmTokenCombined;
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
	return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
UserSchema.methods.getResetPasswordToken = function () {
	// Generate token
	const resetToken = crypto.randomBytes(20).toString('hex');

	// Hash token and set to resetPasswordToken field
	this.resetPasswordToken = crypto
		.createHash('sha256')
		.update(resetToken)
		.digest('hex');

	// Set expire
	this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

	return resetToken;
};
module.exports = mongoose.model('User', UserSchema);
