// External imports
import queryString from 'query-string';

export default function CartLibraryNoConnection(props) {

	const { userToken } = props;



	/*

	async function handleSpotifyAuth(userToken) {

		const response = await fetch(process.env.REACT_APP_BACKEND_TLD + '/api/v1/user_auth/protected/spotify_auth', {
			method: 'GET',
			headers: {
				'Authorization': 'JWT ' + userToken,
				'Content-Type': 'application/json',
				'CORS': 'Access-Control-Allow-Origin'
			}
		});
	}

	*/


	/*
	const client_id = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
	const client_secret = process.env.REACT_APP_SPOTIFY_CLIENT_SECRET;
	const redirect_uri = 'http://localhost:8000/api/v1/user_auth/protected/spotify_auth/callback';	

	// Set Spotify auth variables
	// TODO: Write function to randomly generate this code
	const state = 'jaw98ejff8j39f3lasdjf';
	const scope = 'user-read-playback-state user-modify-playback-state user-read-currently-playing streaming';

	// Construct redirect URL using URI and other data,
	// then redirect to it
	const spotifyURL = ('https://accounts.spotify.com/authorize?' +
		queryString.stringify({
			response_type: 'code',
			client_id: client_id,
			scope: scope,
			redirect_uri: redirect_uri,
			state: state
		}));
	*/
		
	return(
		<section className="CartLibraryNoConnect">
			<h1 className="Util_logoText">TEXT PLACEHOLDER</h1>
			<a href="http://localhost:8000/api/v1/user_auth/protected/spotify_auth">Connect to Spotify Premium</a>
			{/*<button type="button" onClick={(event) => handleSpotifyAuth(userToken)}>Auth</button>*/}
			{/*<a href={spotifyURL}>Connect to Spotify Premium</a>*/}
		</section>
	)

}