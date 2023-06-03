// External imports
import { Fragment, useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCookies } from 'react-cookie';

// Internal imports
import CartPlayer from './CartPlayer.js';
import { AuthContext } from '../contexts/AuthContext.js';
import { jwtApiCall } from '../utilities/userAuth.js';

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
		setDeleteMode(prev => !prev);
	}

	function handleCartridgeSelection(cart) {
		setActiveCart(cart);
	}

	async function handleCartridgeDeletion(e, cart) {
		// Stop event
		e.stopPropagation();

		// Send DELETE request to back end
		const response = await jwtApiCall('/library/delete_cart?cart_id='.concat(cart.cart_id), 'DELETE', authToken);

		// Upon successful completion, fetch user library
		const fetchedUserLibraryJSON = await jwtApiCall('/library/get_library', 'GET', authToken);
		setUserLibrary(fetchedUserLibraryJSON.library);

	}

	function handleCartridgeEjection(cart) {
		if (activeCart) {
			setActiveCart(null);
		}
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
			let userLibraryIterated = userLibrary.map((album) => {
				return (
					<div className="CartLibrary_shadow" key={album.cart_id}>
						<div className="CartLibrary_albumPlastic" onClick={(e) => { handleCartridgeSelection(album) }}>
							<div className="CartLibrary_album">
								<button type="button" className={`CartLibrary_album_deleteBtn ${deleteMode ? '' : 'hidden'}`} onClick={(e) => { handleCartridgeDeletion(e, album) }}>X</button>
								<p className="CartLibrary_album_artists">{album.artists_array[0]}</p>
								<p className="CartLibrary_album_title">{album.cart_name}</p>
							</div>
						</div>
					</div>
				);
			})
			if (userLibrary.length % 2 !== 0) {
				userLibraryIterated = userLibraryIterated.concat(
					<div className="CartLibrary_shadow" key="0">
					</div>
				)
			}
			setUserLibraryView(userLibraryIterated);
		}

	}, [userLibrary, deleteMode])

	return (
		<section className={`CartLibrary ${activeCart ? '' : 'Util_animPaused'}`}>
			<div className="CartLibrary_playerContainer">
				<CartPlayer activeCart={activeCart} authToken={authToken} spotifyToken={spotifyToken} setActiveCart={setActiveCart} />
			</div>
			<div className="CartLibrary_collectionContainer">
				<div className="CartLibrary_collectionButtons">
					<Link to='/create_cart' className="Util_linkBtnSecondary Util_btnThin CartLibrary_button">Create new cartridge</Link>
					<button type="button" className={`Util_btnSecondary Util_btnThin CartLibrary_button ${deleteMode ? 'Util_btnDepressed' : ''}`} onClick={handleCartridgeDeleteMode}>Remove cartridges...</button>
				</div>
				{/*Cartridge "storage" area*/}
				<div className="CartLibrary_collectionInner">
					{userLibraryView}
				</div>
			</div>
		</section>
	);
}
