const express = require('express');
const router = express.Router();

router.route('/')
	// GET requests send users to first step in Spotify authorization
	// process, whereby users are connected to Spotify Accounts Service,
	// told what permissions this router.is asking for, and are asked to log into
	// Spotify itself; based on docs at https://developer.spotify.com/documentation/general/guides/authorization/code-flow/
	.get(spotifyAuth);

router.route('/callback')
	// Callback route that Spotify will redirect to
	// following user's successful login to Spotify's native
	// auth services; based on docs at https://developer.spotify.com/documentation/general/guides/authorization/code-flow/
	.get(spotifyAuthCallback);

router.route('/refresh_token')
	.post();

module.exports = router;