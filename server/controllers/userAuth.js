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

	// Set max JWT age to 14 days
	const MAX_TOKEN_AGE = 60 * 60 * 24 * 14;

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

				userToken = jwt.sign(
					userObject, 
					process.env.JWT_SECRET,
					{
						expiresIn: MAX_TOKEN_AGE
					});


				// Update connection status after successful querying
				connectionStatus = 'success';

				// If login successful, set JSON object key-values
				if (userToken) {
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
					user_token: userToken,
					max_age: MAX_TOKEN_AGE
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

module.exports = {
	createUser,
	verifyUser,
}