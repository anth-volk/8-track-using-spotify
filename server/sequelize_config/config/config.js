require('dotenv').config();

module.exports = {
	"development": {
		"username": process.env.DB_USERNAME,
		"password": process.env.DB_PASSWORD,
		"database": process.env.DB_NAME_DEV,
		"host": process.env.DB_HOST,
		"dialect": "postgres"
	},
	"test": {
		"username": process.env.DB_USERNAME,
		"password": process.env.DB_PASSWORD,
		"database": process.env.DB_NAME_TEST,
		"host": process.env.DB_HOST,
		"dialect": "postgres"
	},
	"production": {
		"username": process.env.DB_PROD_USERNAME,
		"password": process.env.DB_PROD_PASSWORD,
		"database": process.env.DB_NAME_PROD,
		"host": process.env.DB_PROD_HOST,
		"url": process.env.DB_PROD_URL,
		"dialect": "postgres",
		"ssl": true,
		"dialectOptions": {
			"ssl": true
		}
	}
}
