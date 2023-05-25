// External imports
import React, { Fragment, useContext } from 'react';
import { NavLink } from 'react-router-dom';

// Internal imports
import { AuthContext } from '../contexts/AuthContext.js';

// Style imports
import '../styles/Navbar.css';

export default function Navbar(props) {

	// Props: logout handler from App component
	const handleLogout = props.handleLogout;

	const { setDidLogIn, authToken } = useContext(AuthContext);

	if (!authToken) {
		return (
			<nav>
				<h2 className='navbar_logo'>STEREO 8s</h2>
				<ul>
					<li>
						<NavLink to='/' className='active'>Home</NavLink>
					</li>
					<li>
						<NavLink to='/signup' className='active'>Sign Up</NavLink>
					</li>
					<li>
						<NavLink to='/login' className='active'>Log In</NavLink>
					</li>
				</ul>
			</nav>
		);
	} else {
		return (
			<Fragment>
				<nav>
					<h2 className='navbar_logo'>TEXT PLACEHOLDER</h2>
					<ul>
						<li>
							<NavLink to='/' className='active'>Home</NavLink>
						</li>
						<li>
							<NavLink to='/library' className='active'>My Library</NavLink>
						</li>
						<li>
							{/*<NavLink to='/logout' className='active'>Log Out</NavLink>*/}
							<button type='button' className='logout_handler' onClick={handleLogout}>Log Out</button>
						</li>
					</ul>
				</nav>
			</Fragment>
		);
	}

}