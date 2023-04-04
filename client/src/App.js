// External imports
import { Fragment, useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';

// Component imports
import Navbar from './components/Navbar.js';
import Home from './components/Home.js';
import Login from './components/Login.js';
import Signup from './components/Signup.js';


// Style imports
import './styles/App.css';

function App() {

	// State variable for user object
	const [userObject, setUserObject] = useState(null);

	// Fetch locally stored user ID from localStorage;
	// this is a very basic authentication method, and is
	// definitely not the most secure method possible
	useEffect(() => {

		async function fetchUser() {





		}

		fetchUser();

	}, [])


	return (
		<Fragment>
			<Navbar userId={userId} />

			<Routes>
				<Route 
					path='/' 
					element={
						userId ? (
							{/*<CartLibrary />*/}
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
