export default function NoConnection(props) {

	const BACKEND_URL = process.env.REACT_APP_BACKEND_TLD;

	return(
		<section className="CartLibraryNoConnect">
			<h1 className="Util_logoText">TEXT PLACEHOLDER</h1>
			<a href={BACKEND_URL + '/api/v1/spotify_auth'}>Connect to Spotify Premium</a>
			{/*<button type="button" onClick={(event) => handleSpotifyAuth(userToken)}>Auth</button>*/}
			{/*<a href={spotifyURL}>Connect to Spotify Premium</a>*/}
		</section>
	)

}