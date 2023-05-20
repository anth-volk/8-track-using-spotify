export function retrieveAuthToken() {
	return sessionStorage.getItem('authToken');
}

/**
 * Store auth token in sessionStorage
 * @param {string} token A signed JWT
 */
export function storeAuthToken(token) {
	sessionStorage.setItem('authToken', token);
}

export function retrieveAuthTokenMaxAge() {
	return sessionStorage.getItem('authTokenMaxAge');
}

export function storeAuthTokenMaxAge(age) {
	sessionStorage.setItem('authTokenMaxAge', age);
}

export function retrieveRefreshToken() {
	return sessionStorage.getItem('refreshToken');
}

/**
 * Store refresh token in sessionStorage
 * @param {string} token A signed JWT
 * @param {number} maxAge The maximum age of the token, in seconds
 */
export function storeRefreshToken(token) {
	sessionStorage.setItem('refreshToken', token);
}

export function retrieveRefreshTokenMaxAge() {
	return sessionStorage.getItem('refreshTokenMaxAge');
}

export function storeRefreshTokenMaxAge(age) {
	sessionStorage.setItem('refreshTokenMaxAge', age);
}

// This function may need to be debugged and/or
// written with async/await to improve clarity
export function refreshToken(token) {

	console.log('Refreshing tokens...');

	// This is written with thens instead of async/await to enable calling inside useEffect
	fetch(process.env.REACT_APP_BACKEND_TLD + '/api/v1/user_auth/refresh_token', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'CORS': 'Access-Control-Allow-Origin',
			'Authorization': 'JWT ' + token
		},
	}).then((res) => {
		console.log('res: ', res);
		return res.json();
	}).then((resJSON) => {

		console.log(resJSON);

		// Remove existing token values
		sessionStorage.clear();

		// Add new token values
		storeAuthToken(resJSON.auth_token);
		storeAuthTokenMaxAge(resJSON.auth_token_max_age);
		storeRefreshToken(resJSON.refresh_token);
		storeRefreshTokenMaxAge(resJSON.refresh_token_max_age);

	});

}

/**
 * Make request to JWT-protected routes located on the back end
 * @param {string} route The route to make a request to
 * @param {string} method The request method, usually 'GET' or 'POST'
 * @param {import("jsonwebtoken").Jwt} authToken A JSON web token
 * @param {string} [query] An optional query parameter to include
 * @param {object} [body] An optional body to be transmitted on POST requests
 * @param {boolean} [secondCall] An optional boolean representing whether or not function is being invoked again
 * @returns JSON object
 */
export async function jwtApiCall(route, method, authToken, query = '', body, secondCall = false) {

	const responseObjectRaw = await fetch(process.env.REACT_APP_BACKEND_TLD + '/api/v1/protected' + route + query, {
		method: method,
		headers: {
			'Content-Type': 'application/json',
			'CORS': 'Access-Control-Allow-Origin',
			'Authorization': 'JWT ' + authToken
		},
		body: body ? body : null
	});

	console.log(responseObjectRaw);

	if (responseObjectRaw.ok) {

		const responseObjectJSON = await responseObjectRaw.json();

		return responseObjectJSON;
	}
	else if (responseObjectRaw.status === 401) {
		const retrievedRefreshToken = retrieveRefreshToken();

		refreshToken(retrievedRefreshToken);

		const newAuthToken = retrieveAuthToken();
		console.log('nAT: ', newAuthToken);

		jwtApiCall(route, method, newAuthToken, query = '', body, true);

	}



}