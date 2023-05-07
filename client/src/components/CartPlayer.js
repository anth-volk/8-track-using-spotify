// External imports
import {
	Fragment,
	useEffect,
	useRef,
	useState
} from 'react';

// Internal imports
import SpotifyPlayer from './SpotifyPlayer.js';
import LocalPlayer from './LocalPlayer.js';

export default function CartPlayer(props) {

	const spotifyUserAuthToken = props.authToken || null;
	const activeCart = props.activeCart || null;

	const NUMBER_OF_PROGRAMS = 4;

	const FADE_IN_TIMESTAMP_MS = 0;

	const FADE_IN_LENGTH_MS = 2000;
	const FADE_OUT_LENGTH_MS = 2000;
	const PROGRAM_SELECTOR_LENGTH_MS = 0;

	const EFFECT = 'EFFECT';
	const SPOTIFY_TRACK = 'SPOTIFY_TRACK';

	// Note that activeProgram will select 0-3; when rendered, if the 
	// number to be displayed is needed, it is imperative to add 1
	const [cartArray, setCartArray] = useState(null);
	const [activeTrack, setActiveTrack] = useState(null);
	const [activeTrackIndex, setActiveTrackIndex] = useState(null);
	const [activeProgramNumber, setActiveProgramNumber] = useState(0);
	const [isCartPlaying, setIsCartPlaying] = useState(false);
	const [playbackMessage, setPlaybackMessage] = useState('');

	// Spotify SDK effect hooks
	const [isSpotifyActive, setIsSpotifyActive] = useState(false);

	// May delete this hook
	const [isSpotifyTrackEnded, setIsSpotifyTrackEnded] = useState(false);

	function handlePlayPause() {
		if (activeCart) {
			setIsCartPlaying(prev => !prev);
		}
	}

	function handleProgramChange() {
		setActiveProgramNumber( (prev) => {
			console.log('prev: ', prev);

			// 1 is subtracted to ensure programs run 
			// from #0 to #3 internally
			if (prev < NUMBER_OF_PROGRAMS - 1) {
				return prev += 1;
			}
			else {
				return 0;
			}
		})
	}

	return (
		<Fragment>
		<div className='container'>
			<div className='main-wrapper'>
				{/*Empty 8-track player visual*/}
				{/*Inside of that: activeCart details, if present*/}
				{ activeCart && <p className='activeCart_details'>{activeCart.cart_name}</p>}
				<p className='playbackMessage'>{playbackMessage}</p>	
			</div>
			<button type='button' className={`playbackButton ${activeCart && isSpotifyActive && !playbackMessage ? 'active' : 'disabled'}`} onClick={handlePlayPause}>
				{ isCartPlaying ? 'PAUSE' : 'PLAY'}
			</button>
			<SpotifyPlayer 
				spotifyUserAuthToken={spotifyUserAuthToken}
				setIsSpotifyActive={setIsSpotifyActive}
				activeTrack={activeTrack}
				isCartPlaying={isCartPlaying}
			/>
			<LocalPlayer
				activeTrack={activeTrack}
				isCartPlaying={isCartPlaying}
			/>
			<button type='button' className='playbackButton' onClick={handleProgramChange}>PROGRAM</button>
		</div>
	</Fragment>
	)

}