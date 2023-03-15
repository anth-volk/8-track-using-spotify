// Configure hidden environment variables
require('dotenv').config();

// ORM import
const { Sequelize } = require('sequelize');

// Function imports
const { logger } = require('./utilities/logger');

// Express configuration
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// ORM configuration
const sequelize = new Sequelize(
	'database',
	process.env.DB_USERNAME,
	process.env.DB_PASSWORD,
	{
		host: process.env.DB_HOST,
		dialect: 'postgres'
	}
);

app.get('/', (req, res) => {
	res.send('Hello, world!');
});

app.listen(port, (err) => {
	if (err) {
		logger(`Error in server configuration: ${err}`);
	}

	logger('App listening');
});