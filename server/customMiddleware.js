const jwt = require('jsonwebtoken');

/**
 * Middleware for ensuring that Spotify Bearer token is included in requests
 */
function spotifyAuthHeaders(req, res, next) {

	try {

		if (!req.headers || !req.headers.authorization || !req.headers.authorization.split(' ')[0] === 'Bearer') {

			return res
				.status(403)
				.json({
					connection_status: 'failure',
					error_message: 'Error while attempting to connect; misformatted Spotify Bearer token'
				});

		}
		else {
			next();
		}

	}
	catch (err) {
		console.error('Error while attempting to verify Spotify Bearer token: ', err);
	}

}

// Based on tutorial at https://buddy.works/tutorials/securing-node-and-express-restful-api-with-json-web-token#updating-todo-api-folder-structure
/**
 * Middleware for verifying JSON web tokens
 */
function verifyJWT(req, res, next) {

	try {

		if (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'JWT') {

			const decodedData = jwt.verify(req.headers.authorization.split(' ')[1], process.env.JWT_SECRET_AUTH);

			req.user = decodedData;
			console.log(req.user);
		}

		next();

	} catch (err) {

		console.error('Error while authenticating JWT: ', err);
		req.user = undefined;
		res.status(401).json({
			message: 'User not found or token is expired'
		});

	}
}

module.exports = {
	spotifyAuthHeaders,
	verifyJWT
};