// Configure hidden environment variables
require('dotenv').config();

// Other package imports
const bodyParser = require('body-parser');

// Local imports
const { logger } = require('./utilities/logger');
const { createUser } = require('./controllers/userAuth');

// Express setup
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Express configuration
app.use(bodyParser.urlencoded({extended: true}));

// ORM import
const { Sequelize } = require('sequelize');

// ORM configuration
const sequelize = new Sequelize(
	process.env.DB_NAME_DEV,
	process.env.DB_USERNAME,
	process.env.DB_PASSWORD,
	{
		host: process.env.DB_HOST,
		dialect: 'postgres'
	}
);

const User = require('./models/User')(sequelize);
const Cart = require('./models/Cart')(sequelize);

// Routes used for testing
// ------------------------------------------------------------------------------------
app.route('/testing')
	.get( async (req, res) => {

		// Query db
		/*
		const data = await User.findAll();
		console.log("User data:");
		console.log(JSON.stringify(data, null, 2));
		*/

		res.sendFile(__dirname + '/testing/user_auth_test.htm');
	})
	.post( async (req, res) => {

		// Create new user
		await createUser(req);

	res.end();
	});

// ------------------------------------------------------------------------------------

app.get('/', (req, res) => {
	res.send('Hello, world!');
});

app.listen(port, (err) => {
	if (err) {
		logger(`Error in server configuration: ${err}`);
	}

	logger('App listening');
});