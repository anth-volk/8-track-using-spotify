// External imports
require('dotenv').config();
const querystring = require('querystring');
const fetch = require('node-fetch');
const { constructForm, generateRandomString } = require('../utilities/spotify');

// Spotify auth setup
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:8000/api/v1/spotify_auth/callback';
const FRONTEND_URL = 'http://localhost:3000'

// Cookie constants

// Make Spotify auth cookies valid for 30 days
const MAX_AGE = 60 * 60 * 24 * 30

function spotifyAuth(req, res) {

	// Set Spotify auth variables
	// TODO: Write function to randomly generate this code
	const state = generateRandomString(16);
	const scope = 'user-read-playback-state user-modify-playback-state user-read-currently-playing streaming user-read-email user-read-private';

	// Write state var to cookie to verify during callback redirect
	res.cookie('spotify_state', state);

	// Construct redirect URL using URI and other data,
	// then redirect to it
	res.redirect('https://accounts.spotify.com/authorize?' +
		querystring.stringify({
			response_type: 'code',
			client_id: CLIENT_ID,
			scope: scope,
			redirect_uri: REDIRECT_URI,
			state: state
		}));
}

async function spotifyAuthCallback(req, res) {

	// Pull required authorization elements from req
	const code = req.query.code || null;
	const state = req.query.state || null;

	// If state is null
	// TODO: Create better handler for this case
	if (state === null || req.cookies.spotify_state !== state || req.query.error) {
		res.redirect('/error');
	}
	else {

		// Store relevant form options in object
		const spotifyAuthBody = {
			code: code,
			redirect_uri: REDIRECT_URI,
			grant_type: 'authorization_code'
		}

		// Construct form body
		let formBody = constructForm(spotifyAuthBody);

		// Using form body, fetch Spotify API token
		const spotifyRequestRaw = await fetch(
			'https://accounts.spotify.com/api/token',
			{
				method: 'POST',
				headers: {
					'Authorization': 'Basic ' + (new Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')),
					'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
				},
				body: formBody
			}
		);

		// If token is successfully requested...
		if (spotifyRequestRaw.ok) {

			// Convert raw request data to JSON
			const spotifyRequestJSON = await spotifyRequestRaw.json();
			const { access_token, expires_in, refresh_token } = spotifyRequestJSON;

			return res
				.status(200)
				.clearCookie('spotify_state')
				.cookie(
					'userSpotifyAuth',
					{
						'access_token': access_token,
						'expires_in': expires_in,
						'refresh_token': refresh_token,
						'timestamp': Date.now()
					},
					{
						path: '/',
						maxAge: MAX_AGE
					}
				)
				.redirect(FRONTEND_URL + '/library');
		}
		else {

			return res
				.status(500)
				.json({
					connection_status: 'success',
					message: 'Error while requesting Spotify access token'
				});
		}

	};

}

async function spotifyRefresh(req, res) {

	try {
		const refreshToken = req.query.refresh_token;

		// Create object representing body of Spotify refresh POST request
		const formObject = {
			'grant_type': 'refresh_token',
			'refresh_token': refreshToken
		};

		// Construct form body
		const formBody = constructForm(formObject);

		// Using form body, fetch new Spotify auth token
		const spotifyRequestRaw = await fetch('https://accounts.spotify.com/api/token', {
			method: 'POST',
			headers: {
				'Authorization': 'Basic ' + (new Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')),
				'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
			},
			body: formBody
		});

		// If token successfully requested...
		if (spotifyRequestRaw.ok) {
			const spotifyRequestJSON = await spotifyRequestRaw.json();
			const { access_token, expires_in } = spotifyRequestJSON;

			return res
				.status(200)
				.clearCookie('spotify_state')
				.cookie(
					'userSpotifyAuth',
					{
						'access_token': access_token,
						'expires_in': expires_in,
						'refresh_token': refreshToken,
						'timestamp': Date.now()
					},
					{
						path: '/',
						maxAge: MAX_AGE
					}
				)
				.redirect(FRONTEND_URL + '/library');

		}
		else {
			return res
				.status(500)
				.json({
					connection_status: 'success',
					message: 'Error while refreshing Spotify authentication token'
				});
		}



	}
	catch (err) {
		console.error('Error while refreshing Spotify access token: ', err);
		return res
			.status(500)
			.json({
				connection_status: 'failure',
				error: err
			});
	}

}

module.exports = {
	spotifyAuth,
	spotifyAuthCallback,
	spotifyRefresh
}