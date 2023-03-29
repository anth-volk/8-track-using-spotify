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

// Configure ORM User model
const User = require('../models/User')(sequelize);


async function storeSpotifyData(sessionUserID, spotifyRequestJSON) {

	try {

		await User.update({ 
			spotify_access_token: spotifyRequestJSON.access_token,
			spotify_access_token_updatedAt: new Date(),
			spotify_access_token_age: spotifyRequestJSON.expires_in,
			spotify_refresh_token: spotifyRequestJSON.refresh_token
		}, 
		{
			where: {
				user_id: sessionUserID
			}
		});

		return Promise.resolve(true);

	} catch (err) {

		console.error('Error while trying to store Spotify access token:', err);
		return Promise.resolve(false);


	}


}


module.exports = {
	storeSpotifyData
}