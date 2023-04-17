const express = require('express');
const router = express.Router();

router.route('/')
	// GET requests send users to first step in Spotify authorization
	// process, whereby users are connected to Spotify Accounts Service,
	// told what permissions this router.is asking for, and are asked to log into
	// Spotify itself; based on docs at https://developer.spotify.com/documentation/general/guides/authorization/code-flow/
	.get( (req, res) => {

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
				client_id: client_id,
				scope: scope,
				redirect_uri: redirect_uri,
				state: state
			}));

	});

router.route('/callback')
	// Callback route that Spotify will redirect to
	// following user's successful login to Spotify's native
	// auth services; based on docs at https://developer.spotify.com/documentation/general/guides/authorization/code-flow/
	.get(async (req, res) => {

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
				'code': code,
				'redirect_uri': redirect_uri,
				'grant_type': 'authorization_code'
			}

			// Manually construct form body
			// TODO: convert this into async utility function
			let formBody = Object.keys(spotifyAuthBody)
				.reduce( (accu, key) => {
					return accu.concat(encodeURIComponent(key) + '=' + encodeURIComponent(spotifyAuthBody[key]));
				}, [])
				.join('&');

			// Using form body, fetch Spotify API token
			const spotifyRequestRaw = await fetch(
				'https://accounts.spotify.com/api/token',
				{
					method: 'POST',
					headers: {
						'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64')),
						'Content-Type': 'router.ication/x-www-form-urlencoded;charset=UTF-8'
					},
					body: formBody
				}
			);

			// If token is successfully requested...
			if (spotifyRequestRaw.ok) {

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
	});

router.route('/refresh_token')
	.post( (req, res) => {

		

	});

module.exports = router;