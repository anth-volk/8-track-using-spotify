// External imports
const express = require('express');
const router = express.Router();

// Internal imports
const { spotifyAuth, spotifyAuthCallback, spotifyRefresh } = require('../controllers/spotifyAuth.js');

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
	// GET requests refresh expired Spotify tokens; based on docs at
	// https://developer.spotify.com/documentation/web-api/tutorials/code-flow/  
	.get(spotifyRefresh);

module.exports = router;