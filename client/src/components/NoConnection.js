export default function NoConnection(props) {

	return(
		<section className="CartLibraryNoConnect">
			<h1 className="Util_logoText">TEXT PLACEHOLDER</h1>
			<a href="http://localhost:8000/api/v1/user_auth/protected/spotify_auth">Connect to Spotify Premium</a>
			{/*<button type="button" onClick={(event) => handleSpotifyAuth(userToken)}>Auth</button>*/}
			{/*<a href={spotifyURL}>Connect to Spotify Premium</a>*/}
		</section>
	)

}