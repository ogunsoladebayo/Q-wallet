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
		required: true,
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
	createdAt: {
		type: Date,
		default: Date.now,
	},
	modifiedAt: Date,
});

FundSchema.pre('save', () => {
	this.modifiedAt = Date.now();
});

module.exports = mongoose.model('Fund', FundSchema);
