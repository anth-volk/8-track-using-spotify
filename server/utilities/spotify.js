/**
 * The x-www-form-urlencoded HTTP form type
 * @typedef {Object} XWwwFormUrlencoded 
 */

/**
 * Function to construct URI-encoded form body from object
 * @param {Object} formObject 
 * @returns {XWwwFormUrlencoded} The constructed form body
 */
function constructForm(formObject) {

	let formBody = Object.keys(formObject)
		.reduce((accu, key) => {
			return accu.concat(encodeURIComponent(key) + '=' + encodeURIComponent(formObject[key]));
		}, [])
		.join('&');

	return formBody;
}

/**
 * Function to generate a random string, based on function available at
 * https://github.com/spotify/web-api-examples/blob/master/authentication/authorization_code/app.js
 * @param {Number} length 
 * @returns {string} Random string
 */
function generateRandomString(length) {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

	for (let i = 0; i < length; i++) {
		text = text.concat(possible.charAt(Math.floor(Math.random() * possible.length)));
	}
	return text;
}

module.exports = {
	constructForm,
	generateRandomString
};