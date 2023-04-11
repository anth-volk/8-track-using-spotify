// External imports
import { Fragment, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function CartLibrary(props) {

	// Note: userAuth and userSpotifyAuth stored in props

	function handleCartridgeDeletion() {
		return;
	}

	return(
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
				<Link to='/create_cart'>Create new cartridge</Link>
				<button type="button" onClick={handleCartridgeDeletion}>Remove cartridge from library</button>
				{/*Cartridge "storage" area*/}
			</section>
		</Fragment>
	);
}