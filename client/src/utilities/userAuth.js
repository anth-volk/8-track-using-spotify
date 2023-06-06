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

/**
 * Function to refresh auth token based on stored refresh token
 * @param {import("jsonwebtoken").Jwt} token The refresh token (not auth token) stored locally
 * @returns void
 */
export async function refreshToken(token) {

	const resRaw = await fetch(process.env.REACT_APP_BACKEND_TLD + '/api/v1/user_auth/refresh_token', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'CORS': 'Access-Control-Allow-Origin',
			'Authorization': 'JWT ' + token
		}
	})

	const resJSON = await resRaw.json();

	sessionStorage.clear();

	// Add new token values
	storeAuthToken(resJSON.auth_token);
	storeAuthTokenExpiry(resJSON.auth_token_expiry);
	storeRefreshToken(resJSON.refresh_token);
	storeRefreshTokenExpiry(resJSON.refresh_token_expiry);

	return;

}

/**
 * Function to verify whether or not auth token is expired, and if it is, to renew it
 * @returns void
 */
export async function verifyTokenValidity() {
	try {
		const authTokenExpiry = retrieveAuthTokenExpiry();

		if (authTokenExpiry < Date.now()) {
			const retrievedRefreshToken = retrieveRefreshToken();

			await refreshToken(retrievedRefreshToken);
		}
		return;
	}
	catch (err) {
		console.error('Error while verifying JWT auth token validity: ', err);
	}
}

/**
 * Make request to JWT-protected routes located on the back end
 * @param {string} route The route to make a request to
 * @param {string} method The request method, usually 'GET' or 'POST'
 * @param {object} [body] An optional body to be transmitted on POST requests
 * @returns JSON object
 */
export async function jwtApiCall(route, method, body) {

	try {

		await verifyTokenValidity();

		const authToken = retrieveAuthToken();

		const responseObjectRaw = await fetch(process.env.REACT_APP_BACKEND_TLD + '/api/v1/protected' + route, {
			method: method,
			headers: {
				'Content-Type': 'application/json',
				'CORS': 'Access-Control-Allow-Origin',
				'Authorization': 'JWT ' + authToken
			},
			body: body ? body : null
		});

		if (responseObjectRaw.ok) {

			const responseObjectJSON = await responseObjectRaw.json();

			return responseObjectJSON;
		}
		else {

			const responseObjectJSON = await responseObjectRaw.json();
			console.error('Error while executing JWT-protected API call:');
			console.error(responseObjectJSON);

		}
	}
	catch (err) {
		console.error('Error while executing JWT-protected API call: ', err);
	}

}