// Configure hidden environment variables
require('dotenv').config();

// Other package imports
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');

// Local imports
const { spotifyAuthHeaders, verifyJWT } = require('./customMiddleware.js');

// Express setup
const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

// Express configuration
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));
app.use(cookieParser());

// Routes import
const userAuthRoutes = require('./routes/userAuth.js');
const spotifyAuthRoutes = require('./routes/spotifyAuth.js');
const spotifyAPIRoutes = require('./routes/spotifyAPI.js');
const libraryRoutes = require('./routes/library.js');
const errorRoutes = require('./routes/error.js');

// ORM import
const { Sequelize } = require('sequelize');

// ORM configuration
let sequelize = null;
if (process.env.NODE_ENV && process.env.NODE_ENV === 'production') {
	sequelize = new Sequelize(process.env.DB_PROD_URL);
}
else {
	sequelize = new Sequelize(
		process.env.DB_NAME_DEV,
		process.env.DB_USERNAME,
		process.env.DB_PASSWORD,
		{
			host: process.env.DB_HOST,
			dialect: 'postgres'
		}
	);
}

// Middleware
app.use(cors({
	origin: [process.env.FRONTEND_TLD],
	methods: ['GET', 'POST', 'UPDATE', 'DELETE']
}));
app.options('*', cors());
app.use(bodyParser.json());
app.use('/api/v1/protected', verifyJWT);
app.use('/api/v1/spotify_api', spotifyAuthHeaders);

// Routes
app.use('/api/v1/user_auth', userAuthRoutes);
app.use('/api/v1/spotify_auth', spotifyAuthRoutes);
app.use('/api/v1/spotify_api', spotifyAPIRoutes);
app.use('/api/v1/protected/library', libraryRoutes);
app.use('*', errorRoutes);

app.listen(port, (err) => {
	if (err) {
		console.error(`Error in server configuration: ${err}`);
	}

	console.log('App listening on port ' + port);
});