// External imports
import React, { Fragment, useContext } from 'react';
import { Link, NavLink } from 'react-router-dom';

// Internal imports
import { AuthContext } from '../contexts/AuthContext.js';

export default function Navbar(props) {

	// Props: logout handler from App component
	const handleLogout = props.handleLogout;

	const { setDidLogIn, authToken } = useContext(AuthContext);

	if (!authToken) {
		return (
			<nav>
				<h2 className='navbar_logo'>
					<Link to='/' style={{ textDecoration: 'inherit', color: 'inherit' }}>STEREO 8s</Link>
				</h2>
				<ul className='navbar_links'>
					<li className='navbar_link'>
						<NavLink to='/'>Home</NavLink>
					</li>
					<li className='navbar_link'>
						<NavLink to='/signup'>Sign Up</NavLink>
					</li>
					<li className='navbar_link'>
						<NavLink to='/login'>Log In</NavLink>
					</li>
				</ul>
			</nav>
		);
	} else {
		return (
			<Fragment>
				<nav>
					<h2 className='navbar_logo'>
						<Link to='/' style={{ textDecoration: 'inherit', color: 'inherit' }}>STEREO 8s</Link>
					</h2>
					<ul className='navbar_links'>
						<li className='navbar_link'>
							<NavLink to='/'>Home</NavLink>
						</li>
						<li className='navbar_link'>
							<NavLink to='/library'>My Library</NavLink>
						</li>
						<li className='navbar_link'>
							{/*<NavLink to='/logout' className='active'>Log Out</NavLink>*/}
							<button type='button' className='logout_handler' onClick={handleLogout}>Log Out</button>
						</li>
					</ul>
				</nav>
			</Fragment>
		);
	}

}