// Configure hidden environment variables
require('dotenv').config();

// Other package imports
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const querystring = require('querystring');
const fetch = require('node-fetch');


// Local imports
const { logger } = require('./utilities/logger');
const { createUser, verifyUser } = require('./controllers/userAuth');
const { storeSpotifyData } = require('./controllers/spotify');

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

// Spotify auth setup
const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const redirect_uri = 'http://localhost:3000/testing/spotify_auth/callback';

// Routes used for testing
// ------------------------------------------------------------------------------------
app.route('/testing')
	.get( (req, res) => {

		const session = req.session;

		// If user is logged in, show logout link
		if (session.userId) {
			res.sendFile(__dirname + '/testing/user_auth_user_page.html');
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

		// Redirect to GET request on the same route
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

app.route('/testing/spotify_auth')
	.get( (req, res) => {

		// Based on docs at https://developer.spotify.com/documentation/general/guides/authorization/code-flow/
		const session = req.session;

		// Set Spotify auth variables
		// TODO: Write function to randomly generate this code
		const state = 'jaw98ejff8j39f3lasdjf';
		const scope = 'user-read-playback-state user-modify-playback-state user-read-currently-playing streaming';

		// TESTING
		console.log(redirect_uri);

		res.redirect('https://accounts.spotify.com/authorize?' +
			querystring.stringify({
				response_type: 'code',
				client_id: client_id,
				scope: scope,
				redirect_uri: redirect_uri,
				state: state
			}));

	})
	.post()

app.route('/testing/spotify_auth/callback')
	.get( async (req, res) => {

		const session = req.session;
		// TESTING
		console.log(req.session);

		// Based on docs at https://developer.spotify.com/documentation/general/guides/authorization/code-flow/

		// Authorization elements from req
		const code = req.query.code || null;
		const state = req.query.state || null;

		// If state is null
		// TODO: Create better handler for this case
		if (state === null || req.query.error) {
			res.redirect('/error');
		} else {

			// Store relevant form options in object
			const spotifyAuthBody = {
				'code': code,
				'redirect_uri': redirect_uri,
				'grant_type': 'authorization_code'
			}

			// Manually construct form body
			let formBody = Object.keys(spotifyAuthBody)
				.reduce( (accu, key) => {
					return accu.concat(encodeURIComponent(key) + '=' + encodeURIComponent(spotifyAuthBody[key]));
				}, [])
				.join('&');

			const spotifyRequestRaw = await fetch(
				'https://accounts.spotify.com/api/token',
				{
					method: 'POST',
					headers: {
						'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64')),
						'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
					},
					body: formBody
				}
			);


			if (spotifyRequestRaw.ok) {

				// Convert raw request data to JSON
				const spotifyRequestJSON = await spotifyRequestRaw.json();

				// Await input and/or updating of DB via separate controller
				const isSpotifyDataStored = await storeSpotifyData(session.userId, spotifyRequestJSON);
				if (isSpotifyDataStored) {

					// Send to cart library page
					res.send('Placeholder for redirecting to cart library view');
				}
				else {
					res.send('Error while trying to store Spotify authentication data');
				}

			} else {
				res.send('Error in completing Spotify authentication');
			}

		};
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