// Configure hidden environment variables
require('dotenv').config();

// Other package imports
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const querystring = require('querystring');
const fetch = require('node-fetch');
const cors = require('cors');
const jwt = require('jsonwebtoken');

// Local imports
const { logger } = require('./utilities/logger');
const { createUser, verifyJWT, verifyUser, verifyUserSpotifyData } = require('./controllers/userAuth');
const { getAlbumFromSpotify,
	searchSpotifyForAlbum, 
	spotifyAuthHeaders } = require('./controllers/spotify');

// Express setup
const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

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
const redirect_uri = 'http://localhost:8000/api/v1/spotify_auth/callback';
const FRONTEND_URL = 'http://localhost:3000'

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/api/v1/protected', verifyJWT);
app.use('/api/v1/spotify', spotifyAuthHeaders);

app.route('/api/v1/user_auth/login')
	// POST requests will attempt to log user in;
	// if account exists, method will respond with a JSON
	// user object; if account does not exist, method will
	// respond with status 200 and empty user response
	.post(async (req, res) => {

		// Define a user object prototype for emission,
		// as well as default values for its key-value pairs
		let userObjectToEmit = {};
		let connectionStatus = 'failure';
		let dataStatus = null;
		let userToken = null;
		let httpCode = null;

		try {
			// Await completion of verifyUser() and store return JSON web token
			userToken = await verifyUser(req);

			// Update connection status after successful querying
			connectionStatus = 'success';

			// If login successful, set JSON object key-values
			if (userToken) {

				// Update data status
				dataStatus = 'user_exists';
				httpCode = 200;

			} else {

				// Otherwise, add detail to emitted object indicating that user doesn't exist
				dataStatus = 'user_not_found';
				httpCode = 401;

			}

			userObjectToEmit = {
				connection_status: connectionStatus,
				data_status: dataStatus,
				user_token: userToken
			};

			return res.status(httpCode).json(userObjectToEmit);

		} catch (err) {

			// Log error to console
			console.error(`Error while trying to log in: ${err}`);

			// Edit userObjectToEmit to specify issues
			userObjectToEmit = {
				connection_status: connectionStatus,
			};
			return res.status(500).json(userObjectToEmit);

		}

	});

app.route('/api/v1/user_auth/signup')
	// POST requests will create new user, then emit
	// user creation status or an error; DOES NOT create
	// new session or emit completed user object
	.post(async (req, res) => {

		try {

			const createUserReturn = await createUser(req);
			res.status(201).json(createUserReturn);

		} catch (err) {

			console.error(`Error while trying to sign up new user: ${err}`);
			res.status(500);

		}

	})

app.route('/api/v1/protected/library/create_cart')
	// Route to create new cartridge within user's library
	.post(async (req, res) => {

		

	})

/* (Likely) Inactive route
app.route('/api/v1/protected/user_auth/verify_spotify')
	// POST requests will pull server-side data about user
	// regarding any previous Spotify connections
	.post(async (req, res) => {

		try {
			const userSpotifyData = await verifyUserSpotifyData(req.user);

			return res.status(200).json({
				connection_status: 'success',
				user_spotify_data: userSpotifyData
			})

		}
		catch (err) {
			console.error('Error while fetching user Spotify information: ', err);
			return res.status(500);
		}

	});
	*/

app.route('/api/v1/spotify_auth')
	// GET requests send users to first step in Spotify authorization
	// process, whereby users are connected to Spotify Accounts Service,
	// told what permissions this app is asking for, and are asked to log into
	// Spotify itself; based on docs at https://developer.spotify.com/documentation/general/guides/authorization/code-flow/
	.get( (req, res) => {

		// Set Spotify auth variables
		// TODO: Write function to randomly generate this code
		const state = 'jaw98ejff8j39f3lasdjf';
		const scope = 'user-read-playback-state user-modify-playback-state user-read-currently-playing streaming';

		// Write state var to cookie to verify during callback redirect
		res.cookie('spotify_state', state);

		// Construct redirect URL using URI and other data,
		// then redirect to it
		res.redirect('https://accounts.spotify.com/authorize?' +
			querystring.stringify({
				response_type: 'code',
				client_id: client_id,
				scope: scope,
				redirect_uri: redirect_uri,
				state: state
			}));

	});

app.route('/api/v1/spotify_auth/callback')
	// Callback route that Spotify will redirect to
	// following user's successful login to Spotify's native
	// auth services; based on docs at https://developer.spotify.com/documentation/general/guides/authorization/code-flow/
	.get(async (req, res) => {

		// Pull required authorization elements from req
		const code = req.query.code || null;
		const state = req.query.state || null;

		// If state is null
		// TODO: Create better handler for this case
		if (state === null || req.cookies.spotify_state !== state || req.query.error) {
			res.redirect('/error');
		} 
		else {

			// Store relevant form options in object
			const spotifyAuthBody = {
				'code': code,
				'redirect_uri': redirect_uri,
				'grant_type': 'authorization_code'
			}

			// Manually construct form body
			// TODO: convert this into async utility function
			let formBody = Object.keys(spotifyAuthBody)
				.reduce( (accu, key) => {
					return accu.concat(encodeURIComponent(key) + '=' + encodeURIComponent(spotifyAuthBody[key]));
				}, [])
				.join('&');

			// Using form body, fetch Spotify API token
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

			// If token is successfully requested...
			if (spotifyRequestRaw.ok) {

				// Convert raw request data to JSON
				const spotifyRequestJSON = await spotifyRequestRaw.json();
				const { access_token, expires_in, refresh_token } = spotifyRequestJSON;

				const maxAge = 60 * 60 * 24 * 30;

				return res
					.status(200)
					.clearCookie('spotify_state')
					.cookie(
						'userSpotifyAuth',
						{
							'access_token': access_token,
							'expires_in': expires_in,
							'refresh_token': refresh_token,
							'timestamp': Date.now()
						},
						{
							path: '/',
							maxAge: maxAge
						}
					)	
					.redirect(FRONTEND_URL + '/library');
			}
			else {

				// TODO: Replace this placeholder
				res.status(500).redirect('/');
			}

		};
	});

app.route('/api/v1/spotify_auth/refresh_token')
	.post( (req, res) => {

		

	});

app.route('/api/v1/spotify/search_album')
	.get(async (req, res) => {

		if (!req.query || ! req.query.album) {
			return res
				.status(400)
				.json({
					connection_status: 'failure',
					error_message: 'No "album" query parameter provided'
				});
		}
		else {

			const resultObjectRaw = await searchSpotifyForAlbum(req.query.album, req.headers.authorization);
			const resultObjectJSON = await resultObjectRaw.json();

			return res
				.status(200)
				.json({
					connection_status: 'success',
					result_object: resultObjectJSON
				});
		}
	});

app.route('/api/v1/spotify/get_album')
	// GET request takes input data, executes Spotify request, then resolves to output
	.get(async (req, res) => {

		if (!req.query || !req.query.album_id) {
			return res
				.status(400)
				.json({
					connection_status: 'failure',
					error_message: 'No "album ID" query parameter provided'
				});
		}
		else {
			const resultObjectRaw = await getAlbumFromSpotify(req.query.album_id, req.headers.authorization);
			const resultObjectJSON = await resultObjectRaw.json();

			return res
				.status(200)
				.json({
					connection_status: 'success',
					result_object: resultObjectJSON
				});
		}

	})

app.all('*', (req, res) => {
	// For any routes not currently present: redirect to '/error'
	return res
		.status(404)
		.json({
			connection_status: 'failure',
			error_message: 'Resource not found'
		});
});


app.listen(port, (err) => {
	if (err) {
		logger(`Error in server configuration: ${err}`);
	}

	logger('App listening on port ' + port);
});