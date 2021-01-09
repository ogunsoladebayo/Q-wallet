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
		default: 'None',
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
});

module.exports = mongoose.model('Wallet', WalletSchema);
