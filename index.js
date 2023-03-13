// Configure hidden environment variables
require('dotenv').config();

// Configure Express
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Local imports
// TESTING
const { logger } = require('./utilities/logger');

app.get('/', (req, res) => {
	res.send('Hello, world!');
});

app.listen(port, (err) => {
	if (err) {
		logger(`Error in server configuration: ${err}`);
	}

	logger('App listening');
});