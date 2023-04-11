// External imports
import { Fragment, useEffect, useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';

// Internal imports
import CartCreation from './CartCreation.js';

export default function CartLibraryConnected(props) {

	const [isCartCreation, setIsCartCreation] = useState(false);

	// Fetch user's library and store as some sort of data structure

	// Iterate over the data and create a "shelving set" for it...?

	// Handle cartridge deletion
	function handleCartridgeDeletion() {

		// Somehow change styling to indicate that user should click on a cartridge

		// Once clicked, alert asking if user is sure

		// If answer is affirmative

		// Send DELETE request to server

	}

	return(
		<Routes>
			<Route 
				path='' 
				element={
					<Fragment>
						<h1>Cart Library Placeholder</h1>
						<section className="CartLibraryConnected_playerContainer">
							{/*Drawing of 8-track player*/}
							<svg>
								<g className="CartLibraryConnected_player"></g>
							</svg>
							{/*Drawing of uppermost part of "cabinet" with two buttons in it*/}
							<svg>
								<g className="CartLibraryConnected_controls"></g>
							</svg>
							<Link to='/create-cart'>Create new cartridge</Link>
							<button type="button" onClick={handleCartridgeDeletion}>Remove cartridge from library</button>
							{/*Cartridge "storage" area*/}
						</section>
					</Fragment>
				}
			/>
			<Route
				path='/create-cart'
				element={<CartCreation />}
			/>
		</Routes>
	)

}