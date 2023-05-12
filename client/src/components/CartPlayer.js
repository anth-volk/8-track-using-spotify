// External imports
import {
	Fragment,
	useCallback,
	useEffect,
	useRef,
	useState
} from 'react';

// Local function imports
import {
	handlePlayPauseSpotify,
	startSpotifyPlayback
} from '../utilities/spotifyPlayback.js';

import {
	handlePlayPauseLocal,
	handleTrackEndLocal,
	startLocalPlayback
} from '../utilities/localPlayback.js';

// Local audio imports
import tapeHiss from '../audio_files/tape_hiss.mp3';

export default function CartPlayer(props) {

	// Props
	const spotifyUserAuthToken = props.authToken || null;
	const activeCart = props.activeCart || null;

	// Audio refs
	const tapeHissRef = useRef(null);

	// Playback constants
	const NUMBER_OF_PROGRAMS = 4;
	const FADE_IN_TIMESTAMP_MS = 0;
	const FADE_IN_LENGTH_MS = 2000;
	const FADE_OUT_LENGTH_MS = 2000;
	const PROGRAM_SELECTOR_LENGTH_MS = 0;
	const EFFECT = 'EFFECT';
	const SPOTIFY_TRACK = 'SPOTIFY_TRACK';

	// Object of effects
	const effects = {
		FADE_IN: tapeHissRef.current,
		FADE_OUT: tapeHissRef.current,
		INTRA_TRACK_FADE: tapeHissRef.current,
		PROGRAM_SELECTOR: 'PROGRAM_SELECTOR'
	}

	// State for overall playback
	const [cartArray, setCartArray] = useState(null);
	const [activeTrack, setActiveTrack] = useState(null);
	const [activeProgramNumber, setActiveProgramNumber] = useState(0);
	const [isCartPlaying, setIsCartPlaying] = useState(false);
	const [playbackMessage, setPlaybackMessage] = useState('');
	const cartTimestamp = useRef(0);
	const trackIndex = useRef(0);

	// State and refs for Spotify playback
	const [isSpotifyReady, setIsSpotifyReady] = useState(false);
	const [deviceId, setDeviceId] = useState(null);
	const [isActiveSpotifyAudio, setIsActiveSpotifyAudio] = useState(null);
	const spotifyPlayer = useRef(null);

	// State and refs for local playback
	const [isActiveLocalAudio, setIsActiveLocalAudio] = useState(null);
	const localAudioRef = useRef(null);
	const localFileLength = useRef(null);
	const localRemainingPlayLength = useRef(null);

	function handleTrackChange() {
		// If track is of type Spotify...
		if (activeTrack.type === SPOTIFY_TRACK) {
			// if (!isActiveSpotifyAudio) {
		
				startSpotifyPlayback(activeTrack, cartTimestamp.current, deviceId, spotifyUserAuthToken)
					.then( (playbackState) => {
						setIsActiveSpotifyAudio(playbackState);
					});
			/*}
			else {
				handlePlayPauseSpotify(spotifyPlayer.current, isCartPlaying);
			}
			*/
		}
		// Else, if track is local effect...
		else if (activeTrack.type === EFFECT) {
			// if (!isActiveLocalAudio) {
				console.log('!iALA routine');
				localAudioRef.current = activeTrack.audio;
		
				console.log('lAR.c: ', localAudioRef.current);
		
				const playbackObject = startLocalPlayback(activeTrack, localAudioRef.current, cartTimestamp.current);
				localFileLength.current = playbackObject.fileLength;
				localRemainingPlayLength.current = playbackObject.playLength;
				setIsActiveLocalAudio(playbackObject.playbackState);
		
			/*}
			else {
				console.log('hPPL routine');
				handlePlayPauseLocal(localAudioRef.current, isCartPlaying);
			}
			*/
		
		}
	}

	function handlePlayPause() {

		// If there is no deviceId, do nothing
		if (!deviceId) {
			return;
		}

		// If there is no active track, set it
		if (!activeTrack) {
			setActiveTrack(cartArray[activeProgramNumber][0]);
		} 
		// Otherwise, handle play and pause
		else {
			// handleTrackChange();
			if (activeTrack.type === SPOTIFY_TRACK) {
				handlePlayPauseSpotify(spotifyPlayer.current, isCartPlaying);
			}
			else if (activeTrack.type === EFFECT) {
				handlePlayPauseLocal(localAudioRef.current, isCartPlaying);
			}

		}
		setIsCartPlaying( (prev) => !prev);

		/*
		// If track is of type Spotify...
		if (activeTrack.type === SPOTIFY_TRACK) {
			if (!isActiveSpotifyAudio) {

				startSpotifyPlayback(activeTrack, cartTimestamp.current, deviceId, spotifyUserAuthToken)
					.then( (playbackState) => {
						setIsActiveSpotifyAudio(playbackState);
					});
			}
			else {
				handlePlayPauseSpotify(spotifyPlayer.current, isCartPlaying);
			}
		}
		// Else, if track is local effect...
		else if (activeTrack.type === EFFECT) {
			if (!isActiveLocalAudio) {
				localAudioRef.current = activeTrack.audio;

				console.log('lAR.c: ', localAudioRef.current);

				const playbackObject = startLocalPlayback(activeTrack, localAudioRef.current, cartTimestamp.current);
				localFileLength.current = playbackObject.fileLength;
				localRemainingPlayLength.current = playbackObject.playLength;
				setIsActiveLocalAudio(playbackObject.playbackState);

			}
			else {
				handlePlayPauseLocal(localAudioRef.current, isCartPlaying);
			}

		}
		*/


	}

	function handleProgramChange() {
		setActiveProgramNumber( (prev) => {
			if (prev === 3) {
				return 0;
			}
			else {
				return prev + 1;
			}
		})

		console.log('prev aPN: ', activeProgramNumber);
	}

	function checkPlaybackEndLocal() {
		const playbackObject = handleTrackEndLocal(
			activeTrack,
			localAudioRef.current,
			localFileLength.current,
			localRemainingPlayLength.current
		);

		if (playbackObject.playbackState === false) {
			// This will require debugging at end of program
			console.log('playbackState is false');
			trackIndex.current = trackIndex.current + 1;
			console.log('New track index:', trackIndex.current);
			setIsActiveLocalAudio(false);
			setActiveTrack(cartArray[activeProgramNumber][trackIndex.current]);
		}
		else {
			localFileLength.current = playbackObject.fileLength;
			localRemainingPlayLength.current = playbackObject.remainingPlayLength;
		}

		cartTimestamp.current = playbackObject.cartTimestamp;
	}

	const transferSpotifyPlayback = useCallback(async (deviceId) => {
		try {
			console.log('Making POST request to begin playback');
			const fetchResponseRaw = await fetch('https://api.spotify.com/v1/me/player', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': 'Bearer ' + spotifyUserAuthToken
				},
				body: JSON.stringify({
					device_ids: [
						deviceId
					],
					play: false
				})
			});
			if (!fetchResponseRaw.ok) {
				console.log('Error while fetching');
				const fetchResponseJSON = await fetchResponseRaw.json();
				if (fetchResponseJSON && fetchResponseJSON.error && fetchResponseJSON.error.status) {
					console.log(fetchResponseJSON);
					switch(fetchResponseJSON.error.status) {
						case 429:
							return 'Exceeded Spotify API rate limits; please try again in 30+ seconds.';
						case 502:
						default:
							return 'Error while connecting Spotify player; please try again later.';
					}
				}
			}
			else {
				console.log('Fetched successfully');
				setIsSpotifyReady(true);
				return '';
			}
		}
		catch (err) {
			console.error('Error while transferring Spotify playback: ', err);
			return 'Error while connecting Spotify player; please try again later.';
		}

	}, [spotifyUserAuthToken])

	// Testing
	useEffect(() => {
		console.log('new aT: ', activeTrack);
	}, [activeTrack])

	// Spotify SDK hook
	useEffect(() => {

		const script = document.createElement("script");
		script.src = "https://sdk.scdn.co/spotify-player.js";
		script.async = true;
		
		document.body.appendChild(script);
		
		window.onSpotifyWebPlaybackSDKReady = () => {
		
			const playerConstructor = new window.Spotify.Player({
				name: 'Web Playback SDK',
				getOAuthToken: cb => { cb(spotifyUserAuthToken); },
				volume: 1.0
			});
		
			spotifyPlayer.current = playerConstructor;
		
			spotifyPlayer.current.addListener('ready', ({ device_id }) => {
				console.log('Ready with Device ID', device_id);
				setDeviceId(device_id);
			});
		
			spotifyPlayer.current.addListener('not_ready', ({ device_id }) => {
				console.log('Device ID has gone offline', device_id);
				setPlaybackMessage('Spotify device offline; please try again later.');
			});
		
			/*
			spotifyPlayer.current.addListener('player_state_changed', ( state => {
		
				if (!state) {
					return;
				}
		
				spotifyPlayer.current.getCurrentState().then( state => { 
					(!state)
						? setSpotifyStatus(SPOTIFY_STATUSES.CREATING_DEVICE) 
						: setSpotifyStatus(SPOTIFY_STATUSES.CONNECTED) 
				});
		
			}));
			*/
	
			spotifyPlayer.current.on('playback_error', ({message}) => {
				console.error('Failed to perform playback', message);
				setPlaybackMessage('Error while connecting with Spotify. Please try again later.');
			})
		
			spotifyPlayer.current.connect();
		
		};
		
	}, [spotifyUserAuthToken]);

	// Effect hook for transferring Spotify playback
	useEffect(() => {
		if (activeCart && deviceId) {
			setPlaybackMessage('Connecting with Spotify, please wait...');
			transferSpotifyPlayback(deviceId)
				.then( (message) => {
						setPlaybackMessage(message);
				});
		}
	}, [activeCart, deviceId])

	// Effect hook to construct a cart object representation
	// when user selects a cart; could be refactored in future
	useEffect(() => {

		if (!activeCart) {
			return;
		}

		let cartArrayTemp = [];
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
			cartArrayTemp = [
				...cartArrayTemp,
				programArray
			];
		};

		console.log('Cart Array: ', cartArrayTemp);

		// Set this array as state
		setCartArray(cartArrayTemp);

		// Set first item on current program as activeTrack
		//setActiveTrack(cartArrayTemp[activeProgramNumber][0]);

	}, [activeCart, effects.FADE_IN, effects.INTRA_TRACK_FADE, effects.FADE_OUT, effects.PROGRAM_SELECTOR]);

	// Effect hook for changes to active track
	useEffect(() => {

		/*
		if (!activeTrack || !isCartPlaying || (!isActiveLocalAudio && ! isActiveSpotifyAudio)) {
			return;
		}
		else if (activeTrack.type === SPOTIFY_TRACK) {
			startSpotifyPlayback(activeTrack, cartTimestamp.current, deviceId, spotifyUserAuthToken)
				.then( (playbackState) => {
					setIsActiveSpotifyAudio(playbackState);
				});
		}
		else if (activeTrack.type === EFFECT) {
			localAudioRef.current = activeTrack.audio;

			const playbackObject = startLocalPlayback(activeTrack, localAudioRef.current, cartTimestamp.current);
			localFileLength.current = playbackObject.fileLength;
			localRemainingPlayLength.current = playbackObject.playLength;
			setIsActiveLocalAudio(playbackObject.playbackState);
		}
		*/

		console.log('iCP? ', isCartPlaying);

		if (!activeTrack || !isCartPlaying) {
			return;
		}

		handleTrackChange();

	}, [activeTrack])

	/*
	useEffect(() => {
		if (!activeTrack) {
			return;
		}
		else if (activeTrack.type === SPOTIFY_TRACK) {
			handlePlayPauseSpotify(spotifyPlayer.current, isCartPlaying);
		}
		else if (activeTrack.type === EFFECT) {
			handlePlayPauseLocal(localAudioRef.current, isCartPlaying);
		}
	}, [isCartPlaying, activeTrack])
	*/

	// Effect hook to create event listener for local track end
	useEffect(() => {
		if (isActiveLocalAudio) {
			// Create listener for local track end
			console.log('Creating audioRef listener');

			localAudioRef.current.addEventListener('ended', (event) => {
				console.log('Audio ended');
				checkPlaybackEndLocal();
			})
			
			return () => {
				localAudioRef.current.removeEventListener('ended', (event) => {
					console.log('Audio ended');
					checkPlaybackEndLocal();
				})
			}
		}
	}, [isActiveLocalAudio])


	return (
		<Fragment>
		<div className='container'>
			<div className='main-wrapper'>
				{/*Empty 8-track player visual*/}
				{/*Inside of that: activeCart details, if present*/}
				{ activeCart && <p className='activeCart_details'>{activeCart.cart_name}</p>}
				<p className='playbackMessage'>{playbackMessage}</p>
			</div>
			<button type='button' className={`playbackButton ${activeCart ? 'active' : 'disabled'}`} onClick={handlePlayPause}>
				{ isCartPlaying ? 'PAUSE' : 'PLAY'}
			</button>
			<button type='button' className='playbackButton' onClick={handleProgramChange}>PROGRAM</button>
			<div className='audioElements'>
				<audio src={tapeHiss} ref={tapeHissRef} />
			</div>
		</div>
	</Fragment>
	)
}