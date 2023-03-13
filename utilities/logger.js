// Access .env file
require('dotenv').config();

// Require Node fs system
const fs = require('fs');
const path = require('path');

// Take logfile path from .env var and config; .env stores path relative to root, hence the '..'
const RELATIVE_PATH = process.env.LOGFILE_PATH;
const ABSOLUTE_PATH = path.resolve(__dirname, '..', RELATIVE_PATH);

// Function that takes arg and writes arg to logfile
function logger(inputString) {
	// Improve text formatting
	const currentDate = new Date().toUTCString();
	const outputString = `\n${currentDate}:    ${inputString}`;

	fs.writeFile(ABSOLUTE_PATH, outputString, {flag: 'a'}, (err) => {
		if (err) {
			console.error(err);
			return;
		}
	})
}

// Module export statement
module.exports.logger = logger;