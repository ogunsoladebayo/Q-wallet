const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const cors = require('cors');
const helmet = require('helmet');

// Route files
const auth = require('./routes/auth');

dotenv.config();
const app = express();
app.use(morgan('tiny'));

// Set Security HTTP Headers
app.use(helmet());
app.use(
	express.urlencoded({
		extended: false,
	})
);
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

// middlewares
// app.use(errorHandler);

module.exports = app;
