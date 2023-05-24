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

export function retrieveAuthTokenExpiry() {
	return sessionStorage.getItem('authTokenExpiry');
}

export function storeAuthTokenExpiry(expiry) {
	sessionStorage.setItem('authTokenExpiry', expiry);
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

export function retrieveRefreshTokenExpiry() {
	return sessionStorage.getItem('refreshTokenExpiry');
}

export function storeRefreshTokenExpiry(expiry) {
	sessionStorage.setItem('refreshTokenExpiry', expiry);
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
		storeAuthTokenExpiry(resJSON.auth_token_expiry);
		storeRefreshToken(resJSON.refresh_token);
		storeRefreshTokenExpiry(resJSON.refresh_token_expiry);

	});

}

/**
 * Make request to JWT-protected routes located on the back end
 * @param {string} route The route to make a request to
 * @param {string} method The request method, usually 'GET' or 'POST'
 * @param {import("jsonwebtoken").Jwt} authToken A JSON web token
 * @param {object} [body] An optional body to be transmitted on POST requests
 * @param {boolean} [secondCall] An optional boolean representing whether or not function is being invoked again
 * @returns JSON object
 */
export async function jwtApiCall(route, method, authToken, body, secondCall = false) {

	try {

		const responseObjectRaw = await fetch(process.env.REACT_APP_BACKEND_TLD + '/api/v1/protected' + route, {
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
		else if (responseObjectRaw.status === 401 && secondCall === false) {
			const retrievedRefreshToken = retrieveRefreshToken();

			refreshToken(retrievedRefreshToken);

			const newAuthToken = retrieveAuthToken();

			return await jwtApiCall(route, method, newAuthToken, body, true);

		}
	}
	catch (err) {
		console.error('Error while executing JWT-protected API call: ', err);
	}


}