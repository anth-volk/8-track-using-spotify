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

import tapeHiss from '../audio_files/tape_hiss.mp3';

export default function CartPlayer(props) {

	// Audio refs
	const tapeHissRef = useRef(null);

	const spotifyUserAuthToken = props.authToken || null;
	const activeCart = props.activeCart || null;

	const TRACK_EVENT_TYPES = {
		TRACK_END: 'TRACK_END',
		PROGRAM_CHANGE: 'PROGRAM_CHANGE'
	}

	const SPOTIFY_STATUSES = {
		NOT_STARTED: 'NOT_STARTED',
		CREATING_DEVICE: 'CREATING_DEVICE',
		STARTING_LOCAL_PLAYBACK: 'STARTING_LOCAL_PLAYBACK',
		CONNECTED: 'CONNECTED',
		ERROR: 'ERROR',
		RATE_LIMITS: 'RATE_LIMITS'
	}

	const NUMBER_OF_PROGRAMS = 4;

	const FADE_IN_TIMESTAMP_MS = 0;

	const FADE_IN_LENGTH_MS = 2000;
	const FADE_OUT_LENGTH_MS = 2000;
	const PROGRAM_SELECTOR_LENGTH_MS = 0;

	const EFFECT = 'EFFECT';
	const SPOTIFY_TRACK = 'SPOTIFY_TRACK';

	const effects = {
		FADE_IN: tapeHissRef.current,
		FADE_OUT: tapeHissRef.current,
		INTRA_TRACK_FADE: tapeHissRef.current,
		PROGRAM_SELECTOR: 'PROGRAM_SELECTOR'
	}

	// Note that activeProgram will select 0-3; when rendered, if the 
	// number to be displayed is needed, it is imperative to add 1
	const [cartArray, setCartArray] = useState(null);
	const [activeTrack, setActiveTrack] = useState(null);
	const [activeTrackIndex, setActiveTrackIndex] = useState(null);
	const [activeProgramNumber, setActiveProgramNumber] = useState(0);
	const [isCartPlaying, setIsCartPlaying] = useState(false);
	const [playbackMessage, setPlaybackMessage] = useState('');
	const [trackChangeEventQueue, setTrackChangeEventQueue] = useState([]);

	const cartTimestamp = useRef(0);

	// Spotify SDK effect hooks
	const [spotifyStatus, setSpotifyStatus] = useState(SPOTIFY_STATUSES.NOT_STARTED);

	// Likely to delete this hook
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

	// Effect hook for setting playback message
	useEffect(() => {
		switch (spotifyStatus) {
			case SPOTIFY_STATUSES.NOT_STARTED:
			case SPOTIFY_STATUSES.CONNECTED:
				setPlaybackMessage('');
				break;
			case SPOTIFY_STATUSES.CREATING_DEVICE:
			case SPOTIFY_STATUSES.STARTING_LOCAL_PLAYBACK:
				setPlaybackMessage('Connecting to Spotify, please wait...');
				break;
			case SPOTIFY_STATUSES.ERROR:
				setPlaybackMessage('Error while connecting to Spotify. Please try again later.');
				break;
			case SPOTIFY_STATUSES.RATE_LIMITS:
				setPlaybackMessage('Exceeded Spotify API rate limits. Please try again in 30+ seconds.');
				break;
		}	
	}, [spotifyStatus])

	// Effect hook to construct a cart object representation
	// when user selects a cart
	useEffect(() => {

		if (!activeCart) {
			return;
		}

		let cartArray = [];
		let startTimestamp = FADE_IN_TIMESTAMP_MS;

		for (let i = 0; i < NUMBER_OF_PROGRAMS; i++) {
			// Set programNumber
			const programNumber = 'program'.concat(i + 1);

			// Create array for program
			let programArray = [];

			// First, add the fade-in time
			programArray = [
				...programArray,
				{
					audio: effects.FADE_IN,
					type: EFFECT,
					length: FADE_IN_LENGTH_MS,
					start_timestamp: FADE_IN_TIMESTAMP_MS,
					end_timestamp: FADE_IN_LENGTH_MS,
				}
			];

			startTimestamp = FADE_IN_LENGTH_MS + 1;

			// Then, add each cart, followed by intra-track fade (if necessary)
			for (let j = 0; j < activeCart[programNumber].tracks.length; j++) {
				const track = activeCart[programNumber].tracks[j];
				const intraTrackFadeLength = parseInt(activeCart[programNumber].intra_track_fade_length_ms);

				programArray = [
					...programArray,
					{
						audio: track.spotify_track_id,
						type: SPOTIFY_TRACK,
						length: track.duration_ms,
						start_timestamp: startTimestamp,
						end_timestamp: startTimestamp + parseInt(track.duration_ms)
					}
				];

				startTimestamp = startTimestamp + parseInt(track.duration_ms) + 1;

				// If program has intra-track fade length and we haven't reached last track
				// (no intra-track fade after the last track)...

				// Note the odd math: this appears to be due to the fact that the first second
				// of fade is actually second #0
				if (intraTrackFadeLength && j < (activeCart[programNumber].tracks.length - 1)) {
					programArray = [
						...programArray,
						{
							audio: effects.INTRA_TRACK_FADE,
							type: EFFECT,
							length: intraTrackFadeLength - 1,
							start_timestamp: startTimestamp,
							end_timestamp: startTimestamp + intraTrackFadeLength - 1
						}
					];

					startTimestamp = startTimestamp + intraTrackFadeLength;

				}
			}

			// Then, add fade-out
			programArray = [
				...programArray,
				{
					audio: effects.FADE_OUT,
					type: EFFECT,
					length: FADE_OUT_LENGTH_MS,
					start_timestamp: startTimestamp,
					end_timestamp: startTimestamp + FADE_OUT_LENGTH_MS,
				}
			];

			startTimestamp = startTimestamp + FADE_OUT_LENGTH_MS + 1;

			// Finally, add program selector arm
			programArray = [
				...programArray,
				{
					audio: effects.PROGRAM_SELECTOR,
					type: EFFECT,
					length: PROGRAM_SELECTOR_LENGTH_MS,
					start_timestamp: startTimestamp,
					end_timestamp: startTimestamp + PROGRAM_SELECTOR_LENGTH_MS,
				}
			];

			// Finally, concat finished programArray to cartArray
			cartArray = [
				...cartArray,
				programArray
			];
		};

		// Set this array as state
		setCartArray(cartArray);

		// Set first item on current program as activeTrack
		setActiveTrack(cartArray[activeProgramNumber][0]);

	}, [activeCart, activeProgramNumber, effects.FADE_IN, effects.INTRA_TRACK_FADE, effects.FADE_OUT, effects.PROGRAM_SELECTOR]);

	// Effect hook for taking a track change 'event' and 
	// updating activeTrack
	useEffect(() => {

		if (!trackChangeEventQueue || !activeCart || !cartArray) {
			return;
		}

		// This is set up as a queue because the Spotify SDK has no native
		// way of handling track end events, and the best workaround I have found
		// usually fires 2-4 times at track end; the track event queue will be used
		// so that the most recent event can be compared against the previous
		const currentTrackChange = trackChangeEventQueue[trackChangeEventQueue.length - 1];
		const previousTrackChange = trackChangeEventQueue[trackChangeEventQueue.length - 2] || null;

		console.log(currentTrackChange);
		console.log(previousTrackChange);

		// Set cartTimestamp based on track change 'event'
		cartTimestamp.current = currentTrackChange.cartTimestamp;

		// Find index of activeTrack in cartArray
		const index = cartArray[activeProgramNumber].indexOf(activeTrack);

		if (
			currentTrackChange.type === TRACK_EVENT_TYPES.TRACK_END 
			&& (previousTrackChange === null
				|| currentTrackChange.activeTrack.audio !== previousTrackChange.activeTrack.audio
				)
			) {
			// Set activeTrack to be next object
			console.log('Changing track in CartPlayer');
			setActiveTrack(cartArray[activeProgramNumber][index + 1]);
		}
		else {

			// Write function to find track at program number and set as active track

		}

	}, [trackChangeEventQueue, activeCart])

	// TESTING
	useEffect(() => {
		console.log('cartArray: ', cartArray);
	}, [cartArray])

	// TESTING
	useEffect(() => {
		console.log('tCEQ: ', trackChangeEventQueue);
	}, [trackChangeEventQueue])

	return (
		<Fragment>
		<div className='container'>
			<div className='main-wrapper'>
				{/*Empty 8-track player visual*/}
				{/*Inside of that: activeCart details, if present*/}
				{ activeCart && <p className='activeCart_details'>{activeCart.cart_name}</p>}
				<p className='playbackMessage'>{playbackMessage}</p>	
			</div>
			<button type='button' className={`playbackButton ${activeCart && spotifyStatus === SPOTIFY_STATUSES.CONNECTED && !playbackMessage ? 'active' : 'disabled'}`} onClick={handlePlayPause}>
				{ isCartPlaying ? 'PAUSE' : 'PLAY'}
			</button>
			<button type='button' className='playbackButton' onClick={handleProgramChange}>PROGRAM</button>
			<SpotifyPlayer 
				activeCart={activeCart}
				spotifyUserAuthToken={spotifyUserAuthToken}
				setSpotifyStatus={setSpotifyStatus}
				setTrackChangeEventQueue={setTrackChangeEventQueue}
				activeTrack={activeTrack}
				isCartPlaying={isCartPlaying}
				SPOTIFY_STATUSES={SPOTIFY_STATUSES}
				TRACK_EVENT_TYPES={TRACK_EVENT_TYPES}
				cartTimestamp={cartTimestamp.current}
			/>
			<LocalPlayer
				setTrackChangeEventQueue={setTrackChangeEventQueue}
				activeTrack={activeTrack}
				isCartPlaying={isCartPlaying}
				TRACK_EVENT_TYPES={TRACK_EVENT_TYPES}
				cartTimestamp={cartTimestamp.current}
			/>
			<div className='audioElements'>
				<audio src={tapeHiss} ref={tapeHissRef} />
			</div>
		</div>
	</Fragment>
	)

}