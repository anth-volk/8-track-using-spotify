// External imports
require('dotenv').config();
const querystring = require('querystring');
const fetch = require('node-fetch');

// Spotify auth setup
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:8000/api/v1/spotify_auth/callback';
const FRONTEND_URL = 'http://localhost:3000'

function spotifyAuth(req, res) {

	// Set Spotify auth variables
	// TODO: Write function to randomly generate this code
	const state = 'jaw98ejff8j39f3lasdjf';
	const scope = 'user-read-playback-state user-modify-playback-state user-read-currently-playing streaming';

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

	console.log(code);
	console.log(state);
	console.log('Entered spotifyAuthCallback');

	console.log(req.query);

	// If state is null
	// TODO: Create better handler for this case
	if (state === null || req.cookies.spotify_state !== state || req.query.error) {
		console.log('Entering error route 1');
		res.redirect('/error');
	} 
	else {

		// Store relevant form options in object
		const spotifyAuthBody = {
			'code': code,
			'redirect_uri': REDIRECT_URI,
			'grant_type': 'authorization_code'
		}

		console.log(spotifyAuthBody);

		// Manually construct form body
		// TODO: convert this into async utility function
		let formBody = Object.keys(spotifyAuthBody)
			.reduce( (accu, key) => {
				return accu.concat(encodeURIComponent(key) + '=' + encodeURIComponent(spotifyAuthBody[key]));
			}, [])
			.join('&');

		console.log(formBody);

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

		console.log(spotifyRequestRaw);

		// If token is successfully requested...
		if (spotifyRequestRaw.ok) {

			console.log('spotifyRequestRaw ok');

			// Convert raw request data to JSON
			const spotifyRequestJSON = await spotifyRequestRaw.json();
			const { access_token, expires_in, refresh_token } = spotifyRequestJSON;

			const maxAge = 60 * 60 * 24 * 30;

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
						maxAge: maxAge
					}
				)	
				.redirect(FRONTEND_URL + '/library');
		}
		else {

			// TODO: Replace this placeholder
			res.status(500).redirect('/');
		}

	};
	
}

module.exports = {
	spotifyAuth,
	spotifyAuthCallback
}