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

// Local function imports
import { retrieveAuthToken } from './utilities/userAuth.js';

// Style imports
import './styles/App.css';

function App() {

	// State variable for user object
	const [authToken, setAuthToken] = useState(null);
	const [spotifyToken, setSpotifyToken] = useState(null);

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
		const retrievedAuthToken = retrieveAuthToken();

		if (retrievedAuthToken) {
			setAuthToken(retrievedAuthToken);
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
	}, [])


	return (
		<Fragment>
			<Navbar authToken={authToken} />

			<Routes>
				<Route path='/' element={<Home />} />
				<Route path='/login' element={<Login />} />
				<Route path='/signup' element={<Signup />} />
				<Route
					path='/library'
					element={
						spotifyToken ? (
							<CartLibrary authToken={authToken} spotifyToken={spotifyToken} />
						) : (
							<NoConnection authToken={authToken} />
						)
					}
				/>
				<Route path='/create_cart' element={<CartCreation authToken={authToken} spotifyToken={spotifyToken} />} />

			</Routes>

		</Fragment>

	);
}

export default App;
