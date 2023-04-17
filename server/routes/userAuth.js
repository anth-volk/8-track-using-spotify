// External imports
const express = require('express');
const router = express.Router();

// Internal imports
const { createUser, verifyUser } = require('../controllers/userAuth.js');

router.route('/login')
	// POST requests will attempt to log user in;
	// if account exists, method will respond with a JSON
	// user object; if account does not exist, method will
	// respond with status 200 and empty user response
	.post(verifyUser);

router.route('/signup')
	// POST requests will create new user, then emit
	// user creation status or an error; DOES NOT create
	// new session or emit completed user object
	.post(createUser);

module.exports = router;