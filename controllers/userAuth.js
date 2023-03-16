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

function hashPassword(password) {

	// Should probably be refactored to be async function
	try {
		const salt = bcrypt.genSaltSync(SALT_ROUNDS);
		const hash = bcrypt.hashSync(password, salt);
		return hash;
	} catch (err) {
		console.error('Error while trying to create new password hash: ', err);
	}
	
}

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

module.exports = {
	createUser
}