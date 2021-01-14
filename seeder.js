const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// Load user model
const User = require('./models/User');

const {
	MONGO_USERNAME,
	MONGO_PASSWORD,
	MONGO_HOSTNAME,
	MONGO_PORT,
	MONGO_DB,
} = process.env;
const url = `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOSTNAME}:${MONGO_PORT}/${MONGO_DB}?authSource=admin`;

// Connect to DB
mongoose.connect(url, {
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
			password: '01234Admin',
		});
		console.log(
			'Admin user created..., email: admin@q-wallet.com, password: 01234Admin'
				.green.inverse
		);
		process.exit();
	} catch (err) {
		console.error(err);
	}
};

if (process.argv[2] === '-i') {
	importData();
}
