// Configure hidden environment variables
require('dotenv').config();

// Other package imports
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const querystring = require('querystring');
const fetch = require('node-fetch');
const cors = require('cors');

// Local imports
const { logger } = require('./utilities/logger');
const { createUser, verifyUser } = require('./controllers/userAuth');
const { storeSpotifyData } = require('./controllers/spotifyAuth');

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
const redirect_uri = 'http://localhost:3000/testing/spotify_auth/callback';

// Middleware
app.use(cors());
app.use('/api', bodyParser.json());

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

// Currently review all of the below routes in order to improve application
//----------------------------------------------------------------

app.route('/')
	// GET requests will display user profile page (if logged in) or
	// default page about program (if not logged in)
	.get( (req, res) => {

		// Set session
		const session = req.session;

		// If session.userId exists and user is Spotify authed, display user portfolio page
			// Write controller to verify that Spotify auth token is fresh enough
			// Write route and controller to refresh stale Spotify auth token
			// Additionally, verify that user's product is "premium"

			// Await controller that fetches user's tape library

			// How to interact with front end?

		// Else if session.userId exists and user isn't Spotify authed, display "Connect with Spotify" page

		// Otherwise, display static page describing the app

		// TODO: Remove placeholder
		res.end('/ route');

	});

app.route('/login')
	// GET requests will display login form;
	// this page will only be linked to pre-auth pages
	.get( (req, res) => {

		// Verify if user is logged in; if so, redirect to '/' route
		const session = req.session;
		if (session.userId) {
			res.redirect('/');
		};

		// Otherwise, display login form

		// TODO: Remove placeholder
		res.end('/login route');


	})
	// POST requests will manage user authentication
	.post(async (req, res) => {

		const session = req.session;

		// Store return value of verifyUser() as userId
		const userId = await verifyUser(req);

		// If login successful, set session's userId value
		if (userId) {
			session.userId = userId;
		};

		// Finally, redirect to '/' route
		res.redirect('/');


	});

app.get('/logout', (req, res) => {

	try {
		req.session.destroy();
	} catch (err) {
		throw new Error('Error while logging out user: ', err);
	} finally {
		res.redirect('/');
	}

});

app.route('/signup')
	// GET requests will display user creation form,
	// unless user is already signed in, in which case
	// the route will redirect to home
	.get( (req, res) => {

		const session = req.session;

		// If user is signed in, then redirect
		if (session.userId) {
			res.redirect('/');
		};

		// Otherwise, display signup form

		// TODO: Remove placeholder
		res.end('/signup route');
	})
	// POST requests will submit user creation form
	.post(async (req, res) => {

		// TESTING: Does this also need try/catch?

		// Await creation of user account
		await createUser(req);

		// Then, redirect to '/' route
		res.redirect('/');

	});

app.route('/spotify_auth')
	// GET requests send users to first step in Spotify authorization
	// process, whereby users are connected to Spotify Accounts Service,
	// told what permissions this app is asking for, and are asked to log into
	// Spotify itself; based on docs at https://developer.spotify.com/documentation/general/guides/authorization/code-flow/
	.get( (req, res) => {

		const session = req.session;

		// Set Spotify auth variables
		// TODO: Write function to randomly generate this code
		const state = 'jaw98ejff8j39f3lasdjf';
		const scope = 'user-read-playback-state user-modify-playback-state user-read-currently-playing streaming';

		// Log the redirect URI to console
		logger('Connecting to first step of Spotify auth process via' + redirect_uri);

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

app.route('/spotify_auth/callback')
	// Callback route that Spotify will redirect to
	// following user's successful login to Spotify's native
	// auth services; based on docs at https://developer.spotify.com/documentation/general/guides/authorization/code-flow/
	.get(async (req, res) => {

		const session = req.session;

		// Pull required authorization elements from req
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

				// Await input and/or updating of DB via separate controller
				const isSpotifyDataStored = await storeSpotifyData(session.userId, spotifyRequestJSON);
				if (isSpotifyDataStored) {

					// Send to cart library page
					// TODO: Replace placeholder with the actual view
					res.send('Placeholder for redirecting to cart library view');
				}
				else {

					// TODO: Replace this placeholder
					res.send('Error while trying to store Spotify authentication data');
				}

			} else {

				// TODO: Replace this placeholder
				res.send('Error in completing Spotify authentication');
			}

		};
	});

app.route('/create_cart')
	// GET requests display cart creation page
	.get( (req, res) => {
		
		// Ensure that user is logged in
		const session = req.session;

		// Display cart creation page

		// TODO: Remove placeholder
		res.end('/create_cart route');

	});

app.route('/api/v1/create_cart/preview/:albumID')
	// GET request will preview cart, but not actually
	// create cart or add to user's library
	.get( (req, res) => {

		// Set albumID as a standalone const
		const albumID = req.params.albumID;

		// Display "loading" (How to bridge back end and front end?)

		// Pass album's data (track list, track lengths, album artwork, 
		// artist(s), album title) to custom controller

		// Custom controller should first pass tracks through algo
		// that determines how to stack them onto cart, then how to 
		// pad them so that each program is the same length

		// Controller should pass "stacked" album to front end to 
		// display tracks on the cart body

		// Change "loading" to "Create cart..." button

	});

app.route('/api/v1/create_cart/create')
	// POST requests will create new cart
	.post( (req, res) => {

		const session = req.session;
		const userId = session.userId;

		// Controller (perhaps a different one, or a sub-controller) 
		// should input data into Carts, Programs, Tracks databases

		// Redirect to '/' route
		res.redirect('/');
		

	});

app.route('/api/v1/create_cart/search')
	// GET requests will search Spotify for album
	.get( (req, res) => {

		// May set up query params in order to use req.query

		// Set maximum number of results to query Spotify for, 
		// based on how many cart creation view can display
		const MAX_RESULTS = 6;

		// Fetch data from Spotify; should this instead be handled by
		// front end? How do SSR and front-end framework interact?

		// Somehow display said data to user (again, probably should be front end)

	});

app.get('/error', (req, res) => {

	// Display error page with 404 code

	// TODO: Remove placeholder
	res.end('/error route');
})

app.all('*', (req, res) => {
	// For any routes not currently present: redirect to '/error'
	res.redirect('/error');
});



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

app.listen(port, (err) => {
	if (err) {
		logger(`Error in server configuration: ${err}`);
	}

	logger('App listening on port ' + port);
});