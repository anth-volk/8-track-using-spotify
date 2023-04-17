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
const { createCartridge } = require('./controllers/library');
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

// Routes import
const userAuthRoutes = require('./routes/userAuth.js');
const spotifyAuthRoutes = require('./routes/spotifyAuth.js');
const spotifyAPIRoutes = require('./routes/spotifyAPI.js');
const libraryRoutes = require('./routes/library.js');

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

// Spotify auth setup
const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const redirect_uri = 'http://localhost:8000/api/v1/spotify_auth/callback';
const FRONTEND_URL = 'http://localhost:3000'

// Routes
app.use('/api/v1/user_auth', userAuthRoutes);
app.use('/api/v1/spotify_auth', spotifyAuthRoutes);
app.use('/api/v1/spotify_api', spotifyAPIRoutes);
app.use('/api/v1/protected/library', libraryRoutes);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/api/v1/protected', verifyJWT);
app.use('/api/v1/spotify', spotifyAuthHeaders);


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