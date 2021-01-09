const mongoose = require('mongoose');

const FundSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.ObjectId,
		ref: 'User',
		required: true,
	},
	wallet: {
		type: mongoose.Schema.ObjectId,
		ref: 'Wallet',
		required: true,
    },
    currency: {
        type: String,
        required: true
    },
	amount: {
		type: Number,
		required: true,
	},
	approvedBy: {
		type: String,
		required: true,
		default: 'Not approved',
	},
});
module.exports = mongoose.model('Fund', FundSchema);
