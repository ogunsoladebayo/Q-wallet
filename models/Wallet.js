const mongoose = require('mongoose');

const WalletSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.ObjectId,
		ref: 'User',
		required: true,
	},
	currency: {
		type: String,
		required: true,
	},
	balance: {
		type: Number,
		required: true,
		default: 0,
	},
	isMain: {
		type: Boolean,
		required: true,
		default: false,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	modifiedAt: Date,
});

WalletSchema.pre('save', () => {
	this.modifiedAt = Date.now();
});

module.exports = mongoose.model('Wallet', WalletSchema);
