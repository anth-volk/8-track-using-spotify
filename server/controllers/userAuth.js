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

// Set max auth token age to 15 minutes in SECONDS
const AUTH_TOKEN_MAX_AGE = 60 * 15;
// Set max refresh token age to 7 days in SECONDS
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 7;

// bcrypt configuration
const SALT_ROUNDS = 10;

/**
 * Function to calculate an expiration date, represented in MS since Unix epoch
 * @param {number} maxAge Max age of item, in SECONDS
 * @returns {number} Expiry date, as represented in MS since Unix epoch
 */
function calculateExpiry(maxAge) {
	return (Date.now() + maxAge * 1000);
}

async function storeRefreshToken(tokenHash, userId) {

	const refreshTokenQuery = await User.update({ refresh_token_hash: tokenHash }, {
		where: {
			user_id: userId
		}
	});

	return refreshTokenQuery;
}

/**
 * Function for hashing values using bcrypt
 * @param {string} value 
 * @returns {string} Returns a hashed password 
*/
async function hashValue(value) {

	try {

		const salt = await bcrypt.genSalt(SALT_ROUNDS);
		const hash = await bcrypt.hash(value, salt);
		return hash;

	} catch (err) {
		throw new Error('Error while hashing value: ', err);
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
		expiresIn: REFRESH_TOKEN_MAX_AGE
	};

	// Generate token
	return jwt.sign(payload, key, options);
}

async function createUser(req, res) {

	try {
		const passwordHash = await hashValue(req.body.password);

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

				const authToken = createAuthToken(userObject);
				const refreshToken = createRefreshToken(userObject);

				/*
				refreshToken = jwt.sign(
					userObject,
					process.env.JWT_SECRET_REFRESH,
					{
						expiresIn: REFRESH_TOKEN_MAX_AGE
					}
				);
				*/

				// Hash refreshToken
				const refreshTokenHash = await hashValue(refreshToken);

				// Store hashed version of refresh token
				const refreshTokenQuery = await storeRefreshToken(refreshTokenHash, userObject.userId);

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
					auth_token_expiry: calculateExpiry(AUTH_TOKEN_MAX_AGE),
					refresh_token: refreshToken,
					refresh_token_expiry: calculateExpiry(REFRESH_TOKEN_MAX_AGE)
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

async function refreshTokens(req, res) {

	try {

		// If user didn't submit refresh token as auth header, resolve with 401
		if (!req.headers || !req.headers.authorization || !(req.headers.authorization.split(' ')[0] === 'JWT')) {
			res
				.status(401)
				.json({
					connection_status: 'failure',
					error: 'Malformed JWT refresh header, please try again'
				})
		}

		const submittedToken = req.headers.authorization.split(' ')[1];

		console.log(submittedToken);
		console.log(typeof submittedToken);

		// Verify that JWT is properly formed
		const decodedToken = jwt.verify(req.headers.authorization.split(' ')[1], process.env.JWT_SECRET_REFRESH);
		const userId = decodedToken.userId;

		// Fetch hashed refresh token from db using userId provided by decoded JWT data
		const { refresh_token_hash: storedTokenHash } = await User.findOne({
			attributes: [
				'refresh_token_hash'
			],
			where: {
				user_id: userId
			},
			raw: true
		});

		console.log('Hash data:');
		console.log(storedTokenHash);
		console.log(typeof storedTokenHash);

		const isRefreshTokenValid = await bcrypt.compare(submittedToken, storedTokenHash);

		if (isRefreshTokenValid) {

			const userObject = {
				userId: userId
			};

			// Generate new standard JWT and refresh token
			const newAuthToken = createAuthToken(userObject);
			const newRefreshToken = createRefreshToken(userObject);

			// Hash new refresh token
			const newRefreshTokenHash = await hashValue(newRefreshToken);

			// Store new refresh token in db
			const refreshTokenQuery = storeRefreshToken(newRefreshTokenHash, userId);

			// Add error testing

			// Resolve
			res
				.status(200)
				.json({
					connection_status: 'success',
					auth_token: newAuthToken,
					auth_token_expiry: calculateExpiry(AUTH_TOKEN_MAX_AGE),
					refresh_token: newRefreshToken,
					refresh_token_expiry: calculateExpiry(REFRESH_TOKEN_MAX_AGE)
				});
		}
		else {
			res
				.status(403)
				.json({
					connection_status: 'success',
					error: 'Invalid refresh token'
				})
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
	refreshTokens
}