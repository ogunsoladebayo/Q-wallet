const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// Load user model
const User = require('./models/User');

// Connect to DB
mongoose.connect(process.env.MONGO_URI, {
	useNewUrlParser: true,
	useCreateIndex: true,
	useFindAndModify: false,
	useUnifiedTopology: true,
});

// Import into DB
const importData = async () => {
	try {
		await User.create({
			name: 'Admin',
			role: 'admin',
			isEmailConfirmed: true,
			email: 'admin@q-wallet.com',
			password: '01234dmin',
		});
		console.log('Admin user created...'.green.inverse);
		process.exit();
	} catch (err) {
		console.error(err);
	}
};

if (process.argv[2] === '-i') {
	importData();
}
