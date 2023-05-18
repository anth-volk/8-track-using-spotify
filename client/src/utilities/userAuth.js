export function retrieveAuthToken() {
	return localStorage.getItem('authToken');
}

/**
 * Store auth token in localStorage
 * @param {string} token A signed JWT
 * @param {number} maxAge The maximum age of the token, in seconds
 */
export function storeAuthToken(token, maxAge) {
	localStorage.setItem('authToken', {
		token: token,
		max_age: maxAge
	});
}

export function retrieveRefreshToken() {
	return localStorage.getItem('refreshToken');
}

/**
 * Store refresh token in localStorage
 * @param {string} token A signed JWT
 * @param {number} maxAge The maximum age of the token, in seconds
 */
export function storeRefreshToken(token, maxAge) {
	localStorage.setItem('refreshToken', {
		token: token,
		max_age: maxAge
	});
}

// This function may need to be debugged and/or
// written with async/await to improve clarity
export function refreshToken(token) {

	// This is written with thens instead of async/await to enable calling inside useEffect

	fetch(process.env.REACT_APP_BACKEND_TLD + '/api/v1/user_auth/refresh_token', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'CORS': 'Access-Control-Allow-Origin',
			'Authorization': 'JWT ' + token
		},
	}).then( (res) => {
		res.json();
	}).then( (resJSON) => {

		/*
		// Remove existing token values
		localStorage.removeItem('authToken');
		localStorage.removeItem('refreshToken');

		// Add new token values
		storeAuthToken({
			token: resJSON.auth_token,
			max_age: resJSON.auth_token_max_age
		});
		storeRefreshToken({
			token: resJSON.refresh_token,
			max_age: resJSON.refresh_token_max_age
		});
		*/

		return resJSON;

	});

}