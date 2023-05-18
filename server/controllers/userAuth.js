// External package imports
require('dotenv').config();
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// ORM import
const { Sequelize } = require('sequelize');

// ORM configuration
const sequelize = new Sequelize(
	process.env.DB_NAME_DEV,
	process.env.DB_USERNAME,
	process.env.DB_PASSWORD,
	{
		host: process.env.DB_HOST,
		dialect: 'postgres'
	}
);
const { User } = require('../models');

// Other constants

// Set max auth token age to 15 minutes
const AUTH_TOKEN_MAX_AGE = 60 * 15;
// Set max refresh token age to 7 days
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 7;

// bcrypt configuration
const SALT_ROUNDS = 10;

/**
 * Function for creating password hashes using bcrypt
 * @param {string} password 
 * @returns {string} Returns a hashed password 
*/
async function hashPassword(password) {

	try {

		const salt = await bcrypt.genSalt(SALT_ROUNDS);
		const hash = await bcrypt.hash(password, salt);
		return hash;

	} catch (err) {
		throw new Error('Error while hashing password: ', err);
	}
	
}

/**
 * Function for creating a standard user auth JWT
 * @param {string} payload 
 * @returns {string} Returns a signed JWT with set options for auth tokens
 */
function createAuthToken(payload) {

	// Set signature key
	const key = process.env.JWT_SECRET_AUTH;

	// Add token expiry to the options object
	const options = {
		expiresIn: AUTH_TOKEN_MAX_AGE
	};

	// Generate token
	return jwt.sign(payload, key, options);
}

/**
 * Function for creating a user auth refresh JWT
 * @param {string} payload 
 * @returns {string} Returns a signed JWT with set options for refresh tokens
 */
function createRefreshToken(payload) {

	// Set key
	const key = process.env.JWT_SECRET_REFRESH;

	// Add token expiry to the options object
	const options = {
		expiresIn: AUTH_TOKEN_MAX_AGE
	};

	// Generate token
	return jwt.sign(payload, key, options);
}

async function createUser(req, res) {

	try {
		const passwordHash = await hashPassword(req.body.password);

		const newUser = await User.create({
			user_id: crypto.randomUUID(),
			email: req.body.email,
			password_hash: passwordHash,
			first_name: req.body.fname,
			last_name: req.body.lname
		});

		return res
			.status(201)
			.json({
				status: 'success',
				user: newUser
			});

	} catch (err) {
		console.error(`Error while trying to create new user: ${err}`);
		return res
			.status(500)
			.json({
				status: 'failure',
				error: err
			});
	}
}

async function verifyUser(req, res) {

	// Define a user object prototype for emission,
	// as well as default values for its key-value pairs
	let userObjectToEmit = {};
	let connectionStatus = 'failure';
	let dataStatus = null;
	let userToken = null;
	let httpCode = null;

	const submittedEmail = req.body.email;
	const submittedPassword = req.body.password;

	try {

		const userQuery = await User.findOne({
			where: {
				email: submittedEmail
			}
		});

		if (userQuery) {

			const isPasswordMatching = await bcrypt.compare(submittedPassword, userQuery.dataValues.password_hash);

			if (userQuery.dataValues.email === submittedEmail && isPasswordMatching) {

				const userObject = {
					userId: userQuery.dataValues.user_id
				}

				/*
				authToken = jwt.sign(
					userObject, 
					process.env.JWT_SECRET_AUTH,
					{
						expiresIn: AUTH_TOKEN_MAX_AGE
					}
				);
				*/

				authToken = createAuthToken(userObject);

				refreshToken = createRefreshToken(userObject);

				/*
				refreshToken = jwt.sign(
					userObject,
					process.env.JWT_SECRET_REFRESH,
					{
						expiresIn: REFRESH_TOKEN_MAX_AGE
					}
				);
				*/

				// Update connection status after successful querying
				connectionStatus = 'success';

				// If login successful, set JSON object key-values
				if (authToken) {
					// Update data status
					dataStatus = 'user_exists';
					httpCode = 200;
				} 
				else {
					// Otherwise, add detail to emitted object indicating that user doesn't exist
					dataStatus = 'user_not_found';
					httpCode = 401;
				}

				userObjectToEmit = {
					connection_status: connectionStatus,
					data_status: dataStatus,
					auth_token: authToken,
					auth_token_max_age: AUTH_TOKEN_MAX_AGE,
					refresh_token: refreshToken,
					refresh_token_max_age: REFRESH_TOKEN_MAX_AGE
				};

				return res.status(httpCode).json(userObjectToEmit);
			}
		} 
		return res
			.status(404)
			.json({
				connection_status: 'success',
				error_message: 'No user found containing provided credentials'
			})

		
	} catch (err) {
		console.error('Error while trying to verify user within database: ', err);
		return res
			.status(500)
			.json({
				connection_status: 'failure',
				error_message: err
			});

	} 

}

async function createRefreshToken(req, res) {

	try {

		// This is where the 'fingerprint' should be analyzed, instead of just decoding
		const decodedData = jwt.verify(req.headers.authorization.split(' ')[1], process.env.JWT_SECRET_REFRESH);

		if(decodedData) {

			// Generate new standard JWT and refresh token
			const newAuthToken = createAuthToken(userObject);
			const newRefreshToken = createRefreshToken(userObject);

			// Resolve
			res
				.status(200)
				.json({
					connection_status: 'success',
					auth_token: newAuthToken,
					auth_token_max_age: AUTH_TOKEN_MAX_AGE,
					refresh_token: newRefreshToken,
					refresh_token_max_age: REFRESH_TOKEN_MAX_AGE
				});
		}
	}
	catch (err) {
		console.error('Error while trying to refresh user auth token: ', err);
		res
			.status(401)
			.json({
				connection_status: 'failure',
				error: err
			});
	}
}

module.exports = {
	createUser,
	verifyUser,
	createRefreshToken
}