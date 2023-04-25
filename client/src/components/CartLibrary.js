// External imports
import { Fragment, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCookies } from 'react-cookie';

// Internal imports
import CartPlayer from './CartPlayer.js';
import WebPlayback from './CartPlayerBoilerplate.js';

export default function CartLibrary(props) {

	// Note: userAuth and userSpotifyAuth stored in props
	const [userLibrary, setUserLibrary] = useState(null);
	const [userLibraryView, setUserLibraryView] = useState(null);
	const [activeCart, setActiveCart] = useState(null);

	const [cookies, setCookie, removeCookie] = useCookies();

	const spotifyUserAuthToken = cookies.userSpotifyAuth.access_token;

	function handleCartridgeDeletion() {
		return;
	}

	function handleCartridgeSelection(cart) {
		setActiveCart(cart);
	}

	useEffect(() => {

		async function fetchUserLibrary() {
			const fetchedUserLibraryRaw = await fetch(process.env.REACT_APP_BACKEND_TLD + '/api/v1/protected/library/get_library', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'CORS': 'Access-Control-Allow-Origin',
					'Authorization': 'JWT ' + cookies.userAuth
				}
			})

			const fetchedUserLibraryJSON = await fetchedUserLibraryRaw.json();
			setUserLibrary(fetchedUserLibraryJSON.library);

		}

		fetchUserLibrary();
	}, [])

	useEffect(() => {

		if (userLibrary) {
			const userLibraryIterated = userLibrary.map( (album) => {
				return (
					<div className="CartLibrary_album" key={album.cart_id} onClick={ (e) => {handleCartridgeSelection(album)}}>
						<p className="CartLibrary_album_title">{album.cart_name}</p>
						<p className="CartLibrary_album_artists">{album.artists_array[0]}</p>
					</div>
				);
			})
			setUserLibraryView(userLibraryIterated);
		}

	}, [userLibrary])

	return(
		<Fragment>
			<h1>Cart Library Placeholder</h1>
			<section className="CartLibrary_playerContainer">
				{/*Drawing of 8-track player*/}
				{/*<CartPlayer activeCart={activeCart} />*/}
				<WebPlayback token={spotifyUserAuthToken}/>
				{/*Drawing of uppermost part of "cabinet" with two buttons in it*/}
				<svg>
					<g className="CartLibrary_controls"></g>
				</svg>
				<Link to='/create_cart'>Create new cartridge</Link>
				<button type="button" onClick={handleCartridgeDeletion}>Remove cartridge from library</button>
				{/*Cartridge "storage" area*/}
				{userLibraryView}
			</section>
		</Fragment>
	);
}