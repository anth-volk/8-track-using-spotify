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


// Style imports
import './styles/App.css';

function App() {

	// State variable for user object
	const [userAuthToken, setUserAuthToken] = useState(null);
	const [userSpotifyToken, setUserSpotifyToken] = useState(null);

	// Cookies object
	const [cookies, setCookie, removeCookie] = useCookies();

	// Determine if user profile and Spotify cookies are present
	useEffect(() => {
		// Determine if userAuth token exists
		console.log(cookies);
		console.log(userAuthToken);
		console.log(userSpotifyToken);

		if(cookies.userAuth) {
			setUserAuthToken(cookies.userAuth);
		}

		// Determine if userSpotifyAuth token exists & isn't expired
		if (cookies.userSpotifyAuth) {
			if (cookies.userSpotifyAuth.expires_in + cookies.userSpotifyAuth.timestamp < Date.now()) {
				// Call route for renewing Spotify auth
			}
			else {
				setUserSpotifyToken(cookies.userSpotifyAuth);
			}
		}
		
	}, [cookies.userAuth, cookies.userSpotifyAuth])


	return (
		<Fragment>
			<Navbar userAuthToken={userAuthToken} />

			<Routes>
				<Route path='/' element={<Home />} />
				<Route path='/login' element={<Login />} />
				<Route path='/signup' element={<Signup />} />
				<Route
					path='/library'
					element={
						userSpotifyToken ? (
							<CartLibrary userAuthToken={userAuthToken} userSpotifyToken={userSpotifyToken} />
						) : (
							<NoConnection userAuthToken={userAuthToken} />
						)
					}
				/>
				<Route path='/create_cart' element={<CartCreation userAuthToken={userAuthToken} userSpotifyToken={userSpotifyToken} />} />

			</Routes>

		</Fragment>

	);
}

export default App;
