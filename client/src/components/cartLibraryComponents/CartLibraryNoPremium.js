// External imports
import { Link } from 'react-router-dom';

export default function CartLibraryNoPremium(props) {

	return(
		<section className="CartLibraryNoPremium">
			<h1 className="Util_logoText">Stereo8s</h1>
			<h2 className="Util_header">Oh No!</h2>
			<p className="Util_p CartLibraryNoPremium_message">A Spotify Premium subscription is required to use the Stereo 8s application. Unfortunately, we can't find your subscription at this time.</p>
			<p className="Util_p CartLibraryNoPremium_message">If you have a premium subscription and feel that there has been an error, please press below to re-try connecting.</p>
			<Link to="/">Re-connect to Spotify Premium</Link>
		</section>
	)

}