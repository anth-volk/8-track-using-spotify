// External imports
const express = require('express');
const router = express.Router();

// Internal imports
const { getAlbum, searchAlbum } = require('../controllers/spotifyAPI.js');

router.route('/search_album')
	.get(searchAlbum);

router.route('/get_album')
	// GET request takes input data, executes Spotify request, then resolves to output
	.get(getAlbum);

module.exports = router;