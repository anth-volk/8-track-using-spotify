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

async function searchSpotifyForAlbum(searchString, authToken) {

	const MAX_RESULTS = 6;

	return await fetch('https://api.spotify.com/v1/search?q=' + searchString + '&type=album&limit=' + MAX_RESULTS, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': authToken
		}
	});

}

async function getAlbumFromSpotify(albumId, authToken) {

	return await fetch('https://api.spotify.com/v1/albums/' + albumId, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': authToken
		}
	});

}

module.exports = {
	getAlbumFromSpotify,
	searchSpotifyForAlbum,
	spotifyAuthHeaders
};