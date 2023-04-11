// External imports
import { Fragment, useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useCookies } from 'react-cookie';

// Component imports
import Navbar from './components/Navbar.js';
import Home from './components/Home.js';
import Login from './components/Login.js';
import Signup from './components/Signup.js';
import CartLibrary from './components/CartLibrary.js';


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

		if(cookies.userAuth) {
			setUserAuthToken(cookies.userAuth);
		}

		if (cookies.userSpotifyAuth) {
			setUserSpotifyToken(cookies.userSpotifyAuth);
		}

	}, [])


	return (
		<Fragment>
			<Navbar userAuthToken={userAuthToken} />

			<Routes>
				<Route 
					path='/*' 
					element={
						userAuthToken ? (
							<CartLibrary userAuthToken={userAuthToken}/>
						) : (
							<Home />
						)
					}
				/>
				<Route path='/login' element={<Login />} />
				<Route path='/signup' element={<Signup />} />
			</Routes>

		</Fragment>

	);
}

export default App;
