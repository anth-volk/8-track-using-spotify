// External imports
import { Fragment, useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCookies } from 'react-cookie';

// Internal imports
import CartPlayer from './CartPlayer.js';
import { AuthContext } from '../contexts/AuthContext.js';
import { jwtApiCall } from '../utilities/userAuth.js';

// Style import
import '../styles/CartLibrary.css';

export default function CartLibrary(props) {

	// Note: userAuth and userSpotifyAuth stored in props
	const [userLibrary, setUserLibrary] = useState(null);
	const [userLibraryView, setUserLibraryView] = useState(null);
	const [activeCart, setActiveCart] = useState(null);
	const [deleteMode, setDeleteMode] = useState(false);

	const [cookies, setCookie, removeCookie] = useCookies();

	const { setDidLogIn, authToken } = useContext(AuthContext);

	// TODO: Replace with props
	const spotifyToken = cookies.userSpotifyAuth.access_token;

	function handleCartridgeDeleteMode() {
		setDeleteMode(true);
	}

	function handleCartridgeSelection(cart) {
		setActiveCart(cart);
	}

	async function handleCartridgeDeletion(cart) {
		// Send DELETE request to back end
		const response = await jwtApiCall('/library/delete_cart?cart_id='.concat(cart.cart_id), 'DELETE', authToken);

		// Upon successful completion, fetch user library
		const fetchedUserLibraryJSON = await jwtApiCall('/library/get_library', 'GET', authToken);
		setUserLibrary(fetchedUserLibraryJSON.library);

	}

	useEffect(() => {

		async function fetchUserLibrary() {
			const fetchedUserLibraryJSON = await jwtApiCall('/library/get_library', 'GET', authToken);

			setUserLibrary(fetchedUserLibraryJSON.library);

		}

		fetchUserLibrary();
	}, [])

	useEffect(() => {

		if (userLibrary) {
			const userLibraryIterated = userLibrary.map((album) => {
				return (
					<div className="CartLibrary_album" key={album.cart_id} onClick={(e) => { handleCartridgeSelection(album) }}>
						<button type="button" className={deleteMode ? '' : 'hidden'} onClick={(e) => { handleCartridgeDeletion(album) }}>X</button>
						<p className="CartLibrary_album_title">{album.cart_name}</p>
						<p className="CartLibrary_album_artists">{album.artists_array[0]}</p>
					</div>
				);
			})
			setUserLibraryView(userLibraryIterated);
		}

	}, [userLibrary])

	return (
		<section className="CartLibrary">
			<div className="CartLibrary_playerContainer">
				<CartPlayer activeCart={activeCart} authToken={authToken} spotifyToken={spotifyToken} />
				{/*Drawing of uppermost part of "cabinet" with two buttons in it*/}
			</div>
			<div className="CartLibrary_collectionContainer">
				<Link to='/create_cart'>Create new cartridge</Link>
				<button type="button" onClick={handleCartridgeDeleteMode}>Remove cartridge from library</button>
				{/*Cartridge "storage" area*/}
				{userLibraryView}
			</div>
		</section>
	);
}