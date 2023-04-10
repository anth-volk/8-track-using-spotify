// External imports
import { Fragment, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// Internal imports
import CartCreation from './cartLibraryComponents/CartCreation.js';

export default function CartLibraryConnected(props) {

	// Fetch user's library and store as some sort of data structure

	// Iterate over the data and create a "shelving set" for it...?

	return(
		<Fragment>
			<h1>Cart Library Placeholder</h1>
			<section className="CartLibraryConnected_playerContainer">
				{/*Drawing of 8-track player*/}
				<g className="CartLibraryConnected_player"></g>
				{/*Drawing of uppermost part of "cabinet" with two buttons in it*/}
				<g className="CartLibraryConnected_controls"></g>
				{/*Cartridge "storage" area*/}
			</section>
		</Fragment>
	)

}