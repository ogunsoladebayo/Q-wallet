//During the test the env variable is set to test
const dotenv = require('dotenv');
dotenv.config();

// process.env.NODE_ENV = 'test';

const {
	MONGO_USERNAME,
	MONGO_PASSWORD,
	MONGO_HOSTNAME,
	MONGO_PORT,
	MONGO_DB,
} = process.env;
const url = `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOSTNAME}:${MONGO_PORT}/${MONGO_DB}?authSource=admin`;

let mongoose = require('mongoose');
let User = require('../models/User');
let Fund = require('../models/Fund');
let Wallet = require('../models/Wallet');

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app');
let should = chai.should();

let auth_token;
chai.use(chaiHttp);

//Our parent block
describe('Admin', () => {
	before((done) => {
		mongoose.connect(url, {
			useNewUrlParser: true,
			useCreateIndex: true,
			useFindAndModify: false,
			useUnifiedTopology: true,
		});
		done();
	});
	// Test that only admin can access route
	describe('test that only admin can access', () => {
		it('it should return "unauthorized" if user is not logged in as admin', (done) => {
			chai.request(server)
				.get('/v1/users')
				.end((err, res) => {
					res.should.have.status(401);
					res.body.should.be.a('object');
					done();
				});
		});
	});

	// Log in as admin user
	describe('Log in with admin details', () => {
		it('Logging in as admin', (done) => {
			chai.request(server)
				.post('/v1/auth/login')
				.send({ email: 'admin@q-wallet.com', password: '01234Admin' })
				.end((err, res) => {
					res.should.have.status(200);
					auth_token = res.body.token;
					done();
				});
		});
	});

	// Test the get user endpoint for not found
	describe('/GET v1/users', () => {
		it('it should return "not found" if user is not found', (done) => {
			chai.request(server)
				.get('/v1/users')
				.set({
					Authorization: `Bearer ${auth_token}`,
				})
				.send({ email: 'not existing user' })
				.end((err, res) => {
					res.should.have.status(404);
					res.body.should.be.a('object');
					done();
				});
		});
	});

	// Test the get user endpoint to get user
	describe('/GET v1/users', () => {
		it('it should return an object containing the particular user', (done) => {
			chai.request(server)
				.get('/v1/users')
				.set({
					Authorization: `Bearer ${auth_token}`,
				})
				.send({ email: 'johndoe@email.com' })
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('object');
					res.body.should.have.property('success').with.equal(true);
					res.body.should.have
						.property('user')
						.with.keys([
							'name',
							'email',
							'role',
							'id',
							'isEmailConfirmed',
							'mainWallet',
						]);
					done();
				});
		});
	});
});
