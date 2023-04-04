// External imports
import React, { Fragment } from 'react';
import { NavLink } from 'react-router-dom';

// Style imports
import '../styles/Navbar.css';

export default function Navbar(props) {
	if (!props.userId) {
		return (
			<Fragment>
				<nav>
					<h2 className='navbar_logo'>TEXT PLACEHOLDER</h2>
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
			</Fragment>
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
							<NavLink to='/logout' className='active'>Log Out</NavLink>
						</li>
					</ul>
				</nav>
			</Fragment>
		);
	}

}