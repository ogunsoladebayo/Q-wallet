const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const cors = require('cors');
const helmet = require('helmet');
const errorHandler = require('./middleware/error');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

// Route files
const auth = require('./routes/auth');
const users = require('./routes/users');
const transactions = require('./routes/transactions');

// env
dotenv.config();

const app = express();

// Cookie parser
app.use(cookieParser());

// Sanitize data
app.use(mongoSanitize());

// Prevent XSS attacks
app.use(xss());

// Rate limiting
const limiter = rateLimit({
	windowMs: 10 * 60 * 1000, // 10 mins
	max: 100,
});
app.use(limiter);

// Prevent http param pollution
app.use(hpp());

// dev logger
app.use(morgan('tiny'));

// Set Security HTTP Headers
app.use(helmet());

// enable CORS
app.use(cors());

// express body parser
app.use(express.json());
app.use(
	express.urlencoded({
		extended: false,
	})
);

// Mount routers
app.use('/v1/auth', auth);
app.use('/v1/users', users);
app.use('/v1/transactions', transactions);

// error handling middleware
app.use(errorHandler);

module.exports = app;
