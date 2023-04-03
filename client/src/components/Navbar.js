// External imports
import React, { Fragment } from 'react';

// Style imports
import '../styles/Navbar.css';

export default function Navbar() {
	return (
		<Fragment>
			<nav>
				<h2 className='navbar_logo'>TEXT PLACEHOLDER</h2>
				<ul>
					<li>
						<a href='#'>Home</a>
					</li>
					<li>
						<a href='/signup'>Sign Up</a>
					</li>
					<li>
						<a href='/login'>Log In</a>
					</li>
				</ul>
			</nav>
		</Fragment>
	);
}