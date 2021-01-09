const mongoose = require('mongoose')

const WalletSchema = new mongoose.Schema({
    walletId: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    currency: {
        type: String,
        required: true
    },
    balance: {
        type: Number,
        required: true,
        default: 0
    },
    isMain: {
        type: Boolean,
        required: true,
        default: true
    }
})