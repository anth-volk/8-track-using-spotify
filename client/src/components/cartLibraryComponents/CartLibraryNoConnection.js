export default function CartLibraryNoConnection(props) {

	const { userToken } = props;

	// Handle connection with Spotify Premium
	function handleSpotifyConnection(userToken) {

		// Call server-side Spotify connection route


	}

	return(
		<section className="CartLibraryNoConnect">
			<h1 className="Util_logoText">TEXT PLACEHOLDER</h1>
			<button className="CartLibraryNoConnect_button" type="button" onClick={handleSpotifyConnection}>Connect to Spotify Premium</button>
		</section>
	)

}