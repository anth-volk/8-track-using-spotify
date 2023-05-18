export function retrieveAuthToken() {
	return localStorage.getItem('authToken');
}

export function storeAuthToken(jwt) {

	localStorage.setItem('authToken', jwt);
}