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

module.exports = {
	constructForm
};