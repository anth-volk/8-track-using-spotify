const express = require('express');
const router = express.Router();

router.route('/login')
	// POST requests will attempt to log user in;
	// if account exists, method will respond with a JSON
	// user object; if account does not exist, method will
	// respond with status 200 and empty user response
	.post(async (req, res) => {

		// Define a user object prototype for emission,
		// as well as default values for its key-value pairs
		let userObjectToEmit = {};
		let connectionStatus = 'failure';
		let dataStatus = null;
		let userToken = null;
		let httpCode = null;

		try {
			// Await completion of verifyUser() and store return JSON web token
			userToken = await verifyUser(req);

			// Update connection status after successful querying
			connectionStatus = 'success';

			// If login successful, set JSON object key-values
			if (userToken) {

				// Update data status
				dataStatus = 'user_exists';
				httpCode = 200;

			} else {

				// Otherwise, add detail to emitted object indicating that user doesn't exist
				dataStatus = 'user_not_found';
				httpCode = 401;

			}

			userObjectToEmit = {
				connection_status: connectionStatus,
				data_status: dataStatus,
				user_token: userToken
			};

			return res.status(httpCode).json(userObjectToEmit);

		} catch (err) {

			// Log error to console
			console.error(`Error while trying to log in: ${err}`);

			// Edit userObjectToEmit to specify issues
			userObjectToEmit = {
				connection_status: connectionStatus,
			};
			return res.status(500).json(userObjectToEmit);

		}

	});

router.route('/signup')
	// POST requests will create new user, then emit
	// user creation status or an error; DOES NOT create
	// new session or emit completed user object
	.post(async (req, res) => {

		try {

			const createUserReturn = await createUser(req);
			res.status(201).json(createUserReturn);

		} catch (err) {

			console.error(`Error while trying to sign up new user: ${err}`);
			res.status(500);

		}

	});

module.exports = router;