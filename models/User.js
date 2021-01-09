const mongoose = require('mongoose');

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
		required: true,
	},
	password: {
		type: String,
		required: [true, 'Please add a password'],
		minlength: 8,
		match: [
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*([^a-zA-Z\d\s])).{8,}$/,
			'Password must be a minimum of 8 characters long and must have at least one uppercase and special character',
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
});

module.exports = mongoose.model('User', UserSchema);
