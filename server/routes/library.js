// External imports
const express = require('express');
const router = express.Router();

// Internal imports
const { postCartridge } = require('../controllers/library.js');

router.route('/create_cart')
	// Route to create new cartridge within user's library
	.post(postCartridge);

module.exports = router;