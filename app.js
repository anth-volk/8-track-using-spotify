// Configure hidden environment variables
require('dotenv').config();

// Other package imports
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');

// Local imports
const { logger } = require('./utilities/logger');
const { createUser, verifyUser } = require('./controllers/userAuth');

// Express setup
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Express configuration
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname));
app.use(cookieParser());

// Express session configuration
app.set('trust proxy', 1);
app.use(session({
	name: '8-Track Player with Spotify user authentication',
	secret: process.env.LOCAL_AUTH_SESSION_CODE,
	resave: false,
	saveUninitialized: false,
	cookie: {
		// TODO: Change this value; currently debugging
		maxAge: Number(process.env.LOCAL_AUTH_SESSION_AGE)
	}

}));

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
	.get( (req, res) => {

		const session = req.session;

		// If user is logged in, show logout link
		if (session.userId) {
			res.sendFile(__dirname + '/testing/user_auth_log_out.html');
		} 
		// Otherwise, show login form
		else {
			res.sendFile(__dirname + '/testing/user_auth_log_in.html');
		}

	})
	.post( async (req, res) => {

		const session = req.session;

		// Create bool that is returned from async verification function
		const userId = await verifyUser(req);

		// If login successful, set session
		if (userId) {
			session.userId = userId;
		}

		// Otherwise, display unable to login

		// Create new user
		/*
		await createUser(req);
		res.sendFile(__dirname + '/testing/user_auth_logged_in.htm');
		*/
		res.redirect('/testing');
	});

app.route('/testing/createUser')
	.get( (req, res) => {
		res.sendFile(__dirname + '/testing/user_auth_create_user.html');
	})
	.post( async (req, res) => {
		await createUser(req);
		res.redirect('/testing');
	});


app.get('/testing/log_out', async (req, res) => {
	req.session.destroy();
	res.redirect('/testing');
})

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