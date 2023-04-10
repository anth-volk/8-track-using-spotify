// External imports
import { Fragment, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Internal imports
import CartLibraryNoConnection from './cartLibraryComponents/CartLibraryNoConnection.js';
import CartLibraryNoPremium from './cartLibraryComponents/CartLibraryNoPremium.js';
import CartLibraryConnected from './cartLibraryComponents/CartLibraryConnected.js';

export default function CartLibrary(props) {

	const SPOTIFY_NO_CONNECTION = 'spotify_no_connection';
	const SPOTIFY_NO_PREMIUM = 'spotify_no_premium';
	const SPOTIFY_CONNECTED = 'spotify_connected';

	const [userSpotifyInfo, setUserSpotifyInfo] = useState(null);
	const [spotifyConnectionStatus, setSpotifyConnectionStatus] = useState(null);

	const navigate = useNavigate();

	// useEffect that executes once on load to verify that user has active Spotify
	// connection and that user is premium
	useEffect(() => {

		async function fetchUserSpotifyInfo(userToken) {

			try {

				const userSpotifyData = await fetch(process.env.REACT_APP_BACKEND_TLD + '/api/v1/user_auth/protected/verify_spotify', {
					method: 'POST',
					headers: {
						'Authorization': 'JWT ' + userToken,
						'Content-Type': 'application/json',
						'CORS': 'Access-Control-Allow-Origin'
					}
				});

				if (userSpotifyData.ok) {

					const userSpotifyDataJSON = await userSpotifyData.json();
					setUserSpotifyInfo(userSpotifyDataJSON.user_spotify_data);

				} 
				else {
					throw new Error('Connection error while fetching user Spotify data; HTTP status code: ', userSpotifyData.status);
				}

			}
			catch (err) {
				console.error('Error while fetching user Spotify data: ', err);
			}

		}

		fetchUserSpotifyInfo(props.userToken);

	}, [props.userToken]);

	// useEffect that executes following database query that determines what
	// user's current spotify connection status is
	useEffect(() => {

		// Define the function to call server-side token refresh route here

		// If there is no Spotify info yet, don't do anything
		if (!userSpotifyInfo) {
			return;
		}

		// Otherwise, if token is expired, refresh it and reload this page
		else if (userSpotifyInfo.spotify_access_token_updatedAt && userSpotifyInfo.spotify_access_token_updatedAt + userSpotifyInfo.spotify_access_token_age < Date.now()) {
			// Call server-side token refresh route function

			// Afterward, refresh this page
			navigate('/');

		}
		else if (!userSpotifyInfo.spotify_access_token) {
			setSpotifyConnectionStatus(SPOTIFY_NO_CONNECTION);
		} 
		else if (!userSpotifyInfo.is_spotify_premium) {
			setSpotifyConnectionStatus(SPOTIFY_NO_PREMIUM);
		}
		else {
			setSpotifyConnectionStatus(SPOTIFY_CONNECTED);
		}

	}, [userSpotifyInfo, navigate]);

	// If the user does not have active Spotify connection,
	// display view that allows user to connect

	// If user does have active Spotify connection but no premium,
	// display view indicating that user must have premium 
	// before proceeding

	// Otherwise, display cart library

	return(
		<Fragment>
			{spotifyConnectionStatus === SPOTIFY_NO_CONNECTION && <CartLibraryNoConnection userToken={props.userToken}/>}
			{spotifyConnectionStatus === SPOTIFY_NO_PREMIUM && <CartLibraryNoPremium userToken={props.userToken} />}
			{spotifyConnectionStatus === SPOTIFY_CONNECTED && <CartLibraryConnected userToken={props.userToken} />}
		</Fragment>	
	);

}