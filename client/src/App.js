// External imports
import { Fragment, useEffect, useState } from 'react';
import { Navigate, Routes, Route } from 'react-router-dom';
import { useCookies } from 'react-cookie';

// Component imports
import Navbar from './components/Navbar.js';
import Home from './components/Home.js';
import Login from './components/Login.js';
import Signup from './components/Signup.js';
import CartLibrary from './components/CartLibrary.js';
import NoConnection from './components/NoConnection.js';
import CartCreation from './components/CartCreation.js';
import { AuthContext } from './contexts/AuthContext.js';

// Local function imports
import {
	retrieveAuthToken,
	retrieveRefreshToken,
	refreshToken,
	storeAuthToken,
	storeRefreshToken
} from './utilities/userAuth.js';

// Style imports
import './styles/App.css';

function App() {

	// State variable for user object
	const [authToken, setAuthToken] = useState(null);
	const [spotifyToken, setSpotifyToken] = useState(null);
	const [didLogIn, setDidLogIn] = useState(null);

	// Cookies object
	const [cookies, setCookie, removeCookie] = useCookies();

	// Determine if user profile and Spotify cookies are present
	useEffect(() => {

		/*
		if(cookies.userAuth) {
			setUserAuthToken(cookies.userAuth);
		}
		*/

		// Determine whether or not authToken is currently present
		const retrievedAuthToken = JSON.parse(retrieveAuthToken()) || null;
		const retrievedRefreshToken = JSON.parse(retrieveRefreshToken()) || null;

		console.log(retrievedAuthToken);
		console.log(retrievedRefreshToken);

		// If the token exists, set it as auth
		if (retrievedAuthToken) {
			console.log('Retrieving auth token');
			setAuthToken(retrievedAuthToken.token);
		}
		// If it doesn't, but refresh token exists, refresh the tokens, then set both
		else if (retrievedRefreshToken) {

			console.log('Retrieving refresh token and refreshing');
			const resJSON = refreshToken(retrievedRefreshToken);

			storeAuthToken(resJSON.auth_token, resJSON.auth_token_max_age);
			storeRefreshToken(resJSON.refresh_token, resJSON.refresh_token_max_age);

			setAuthToken(resJSON.auth_token);
		}

		// Determine if userSpotifyAuth token exists & isn't expired
		if (cookies.userSpotifyAuth) {
			if (cookies.userSpotifyAuth.expires_in + cookies.userSpotifyAuth.timestamp < Date.now()) {
				// Call route for renewing Spotify auth
			}
			else {
				setSpotifyToken(cookies.userSpotifyAuth);
			}
		}
	}, [didLogIn])

	return (
		<Fragment>
			<AuthContext.Provider value={{ setDidLogIn, authToken }}>
				<Navbar />

				<Routes>
					<Route path='/' element={<Home />} />
					<Route path='/login' element={<Login />} />
					<Route path='/signup' element={<Signup />} />
					<Route
						path='/library'
						element={
							spotifyToken ? (
								<CartLibrary spotifyToken={spotifyToken} />
							) : (
								<NoConnection />
							)
						}
					/>
					<Route path='/create_cart' element={<CartCreation spotifyToken={spotifyToken} />} />

				</Routes>
			</AuthContext.Provider>

		</Fragment>

	);
}

export default App;
