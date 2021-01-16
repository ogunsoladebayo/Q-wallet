const mongoose = require('mongoose');

const dotenv = require('dotenv');
dotenv.config();

const {
	MONGO_USERNAME,
	MONGO_PASSWORD,
	MONGO_HOSTNAME,
	MONGO_PORT,
	MONGO_DB,
} = process.env;
// const url = `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOSTNAME}:${MONGO_PORT}/${MONGO_DB}?authSource=admin`;
const url =
	'mongodb+srv://q-wallet:uEvOiDVoE1Qe3M3P@devhub.wzqeb.mongodb.net/q-wallet?retryWrites=true&w=majority';

const connectDB = async () => {
	const conn = await mongoose.connect(url, {
		useNewUrlParser: true,
		useCreateIndex: true,
		useFindAndModify: false,
		useUnifiedTopology: true,
	});

	console.log(
		`MongoDB Connected: ${conn.connection.host}`.cyan.underline.bold
	);
};

module.exports = connectDB;
