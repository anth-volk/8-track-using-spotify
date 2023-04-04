// External imports
import { Fragment, useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';

// Component imports
import Navbar from './components/Navbar.js';

// Style imports
import './styles/App.css';

function App() {

	// Determine if user is authenticated or not; is it possible to somehow pass req.session to app?

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
