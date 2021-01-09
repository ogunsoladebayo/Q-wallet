const mongoose = require('mongoose');

const WalletSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.ObjectId,
		ref: 'User',
		required: false,
	},
	currency: {
		type: String,
		required: false,
	},
	balance: {
		type: Number,
		required: false,
		default: 0,
	},
	isMain: {
		type: Boolean,
		required: false,
		default: true,
	},
});

module.exports = mongoose.model('Wallet', WalletSchema);
