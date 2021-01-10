const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.ObjectId,
		ref: 'User',
		required: true,
	},
	role: {
		type: String,
		enum: ['noob', 'elite', 'admin'],
	},
	action: String,
	fromWallet: {
		type: mongoose.Schema.ObjectId,
		ref: 'Wallet',
		required: true,
	},
	toWallet: {
		type: mongoose.Schema.ObjectId,
		ref: 'Wallet',
		required: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	modifiedAt: Date,
});

LogSchema.pre('save', () => {
	this.modifiedAt = Date.now();
});

module.exports = mongoose.model('Log', LogSchema);
