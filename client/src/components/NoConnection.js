// Style import
import '../styles/NoConnection.css';

export default function NoConnection() {

	const BACKEND_URL = process.env.REACT_APP_BACKEND_TLD;

	return (
		<section className="CartLibraryNoConnection">
			<h1 className="CLNC_header">Now connecting to <span className="Util_logoInText">STEREO 8s...</span></h1>
			<p className="CLNC_text">In order to proceed, please connect to your Spotify Premium&reg; account:</p>
			<a href={BACKEND_URL + '/api/v1/spotify_auth'} className="Util_linkBtnAccent">Connect to Spotify Premium</a>
		</section>
	)

}