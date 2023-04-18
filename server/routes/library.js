// External imports
const express = require('express');
const router = express.Router();

// Internal imports
const { 
	getLibrary, 
	postCartridge 
} = require('../controllers/library.js');

router.route('/create_cart')
	// Route to create new cartridge within user's library
	.post(postCartridge);

router.route('/get_library')
	// GET requests will fetch a user's entire cart library
	.get(getLibrary);

module.exports = router;