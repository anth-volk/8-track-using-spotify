// External package imports
const crypto = require('crypto');
const bcrypt = require('bcrypt');

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

// bcrypt configuration
const SALT_ROUNDS = 10;

const User = require('../models/User')(sequelize);

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
 * Function for creating user by adding them to underlying SQL database (via Sequelize)
 * @param {Object} req The HTTP request body
 * @returns {undefined} Only returns if data is entered successfully; otherwise, raises error
 */
async function createUser(req) {

	const passwordHash = await hashPassword(req.body.password);
	
	try {
		const newUser = await User.create({
			user_id: crypto.randomUUID(),
			email: req.body.email,
			password_hash: passwordHash,
			first_name: req.body.fname,
			last_name: req.body.lname
		});
	} catch (err) {
		console.error('Error while trying to create new user:', err);
	}

}

/**
 * Function for verifying a user's account
 * @param {Object} req The HTTP request body
 * @returns {(UUID|null)} Returns either the user's ID in UUID format, or null if the user could not be found
 */
async function verifyUser(req) {

	const submittedEmail = req.body.email;
	const submittedPassword = req.body.password;
	let userId = null;

	try {

		const userQuery = await User.findOne({
			where: {
				email: submittedEmail
			}
		});

		if (userQuery.dataValues.email) {

			const isPasswordMatching = await bcrypt.compare(submittedPassword, userQuery.dataValues.password_hash);

			if (userQuery.dataValues.email === submittedEmail && isPasswordMatching) {
				
				userId = userQuery.dataValues.user_id;
			}

		}
		
		return userId;

	} catch (err) {

		throw new Error('Error while verifying user: ', err);

	} 

}

module.exports = {
	createUser,
	verifyUser
}