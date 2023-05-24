// External imports
import { Fragment, useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
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
	storeRefreshToken,
	retrieveAuthTokenMaxAge,
	retrieveRefreshTokenExpiry
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

	// React-Router navigate
	const navigate = useNavigate();

	function handleLogout() {
		// Clear all sessionStorage items
		sessionStorage.clear();

		// Set didLogIn to false
		setDidLogIn(false);

		// Redirect to home
		navigate('/');
	}

	// Determine if user profile and Spotify cookies are present
	useEffect(() => {

		async function refreshSpotifyToken(refreshToken) {
			await fetch(process.env.REACT_APP_BACKEND_TLD + '/api/v1/spotify_auth/refresh_token?refresh_token=' + refreshToken, {
				method: 'GET',
				headers: {
					'CORS': 'Access-Control-Allow-Origin'
				}
			});
		}

		console.log('didLogIn changed');

		// Determine whether or not authToken is currently present
		const retAuthToken = retrieveAuthToken();
		const retRefreshToken = retrieveRefreshToken();

		console.log(retAuthToken);
		console.log(retRefreshToken);

		// If the token exists, set it as auth
		if (retAuthToken) {
			setAuthToken(retAuthToken);
		}
		// If it doesn't, but refresh token exists...
		else if (retRefreshToken) {

			// Determine if the token is still valid
			const refreshTokenExpiry = retrieveRefreshTokenExpiry();

			// If the refresh token is expired, log the user out
			if (Date.now() > refreshTokenExpiry) {
				// Log user out
				handleLogout();
			}

			// Otherwise, refresh tokens
			console.log('Retrieving refresh token and refreshing');
			refreshToken(retRefreshToken);

			const retNewAuthToken = retrieveAuthToken();
			setAuthToken(retNewAuthToken);
		}
		// Otherwise, if neither token exists, set authToken to null, providing logged-out UI
		else {
			setAuthToken(null);
		}

		// Determine if userSpotifyAuth token exists & isn't expired
		if (cookies.userSpotifyAuth) {
			if (cookies.userSpotifyAuth.expires_in + cookies.userSpotifyAuth.timestamp < Date.now()) {
				const refreshToken = cookies.userSpotifyAuth.refresh_token;
				refreshSpotifyToken(refreshToken);
			}
			else {
				setSpotifyToken(cookies.userSpotifyAuth);
			}
		}
	}, [didLogIn])

	return (
		<Fragment>
			<AuthContext.Provider value={{ setDidLogIn, authToken }}>
				<Navbar handleLogout={handleLogout} />

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
