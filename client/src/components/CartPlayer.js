// External imports
import { Fragment, useEffect, useRef, useState } from 'react';

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

	const effects = {
		FADE_IN: 'FADE_IN',
		FADE_OUT: 'FADE_OUT',
		INTRA_TRACK_FADE: 'INTRA_TRACK_FADE',
		PROGRAM_SELECTOR: 'PROGRAM_SELECTOR'
	}

	// Note that activeProgram will select 0-3; when rendered, if the actual
	// number is needed, it is imperative to add 1
	const [activeProgramNumber, setActiveProgramNumber] = useState(0);
	const [cartArray, setCartArray] = useState(null);
	const [activeTrack, setActiveTrack] = useState(null);
	const [isCartPlaying, setIsCartPlaying] = useState(false);

	const [isPaused, setIsPaused] = useState(false);
	const [isPlaybackActive, setIsPlaybackActive] = useState(false);
	const [currentTrack, setCurrentTrack] = useState(null);
	const [playbackMessage, setPlaybackMessage] = useState('');

	const activeTime = useRef(0);
	const intervalRef = useRef(null);

	const spotifyPlayer = useRef(null);
	const deviceId = useRef(null);

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

		console.log('Last program: ', activeProgramNumber);
	}

	async function startSpotifyPlayback(uri, startTime) {
		try {
			const responseRaw = await fetch('https://api.spotify.com/v1/me/player/play', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': 'Bearer ' + spotifyUserAuthToken
				},
				body: JSON.stringify({
					uris: [
						"spotify:track:" + uri
					],
					position_ms: startTime
				})
			});
			if (!responseRaw.ok) {
				const responseJSON = await responseRaw.json();
				console.error('Network-related error while initiating Spotify playback: ', responseJSON);
			}
		}
		catch (err) {
			console.error('Error while initiating Spotify playback: ', err);
		}
	}

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
				volume: 0.5
			});
	
			spotifyPlayer.current = playerConstructor;
			// setPlayer(player);
	
			spotifyPlayer.current.addListener('ready', ({ device_id }) => {
				console.log('Ready with Device ID', device_id);
				deviceId.current = device_id;
				// setDeviceId(device_id);
			});
		
			spotifyPlayer.current.addListener('not_ready', ({ device_id }) => {
				console.log('Device ID has gone offline', device_id);
			});
		
			spotifyPlayer.current.addListener('player_state_changed', ( state => {
	
				if (!state) {
					return;
				}
	
				setCurrentTrack(state.track_window.current_track);
				setIsPaused(state.paused);
	
				spotifyPlayer.current.getCurrentState().then( state => { 
					(!state)? setIsPlaybackActive(false) : setIsPlaybackActive(true) 
				});
	
			}));
	
			spotifyPlayer.current.on('playback_error', ({message}) => {
				console.error('Failed to perform playback', message);
			})
	
			spotifyPlayer.current.connect();
		
		};
	
	}, [spotifyUserAuthToken]);

	/*
	useEffect(() => {

		async function transferPlayback() {

			setPlaybackMessage('Loading Spotify player...');

			try {
				const fetchResponseRaw = await fetch('https://api.spotify.com/v1/me/player', {
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': 'Bearer ' + spotifyUserAuthToken
					},
					body: JSON.stringify({
						device_ids: [
							deviceId.current
						],
						play: true
					})
				});
				if (!fetchResponseRaw.ok) {
					const fetchResponseJSON = await fetchResponseRaw.json();
					if (fetchResponseJSON && fetchResponseJSON.error && fetchResponseJSON.error.status) {
						console.log(fetchResponseJSON);
						switch(fetchResponseJSON.error.status) {
							case 502:
								setPlaybackMessage('Error while loading Spotify player; please try again later');
								break;
							case 429:
								setPlaybackMessage('App has exceeded Spotify API limits; please try again in 30+ seconds');
								break;
							default:
								setPlaybackMessage('');
								break;
						}
					}
				}
				else {
					setPlaybackMessage('');
				}
			}
			catch (err) {
				console.error('Error while transferring Spotify playback: ', err);
				setPlaybackMessage('Error while loading Spotify player; please try again later');
			}

		}

		if (deviceId.current && activeCart && !isPlaybackActive) {
			transferPlayback();
		}

	}, [deviceId, activeCart, isPlaybackActive]);
	*/


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
					start_timestamp: startTimestamp,
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

	useEffect(() => {

		if (!cartArray || !isCartPlaying) {
			return;
		}

		// Clear any existing timeout
		clearInterval(intervalRef.current);

		// Every ms, check to see if active track
		// has reached its end
		intervalRef.current = setInterval(() => {	

			if (activeTime.current === activeTrack.end_timestamp) {
				// Find index of activeTrack in cartArray
				const index = cartArray[activeProgramNumber].indexOf(activeTrack);

				// Set activeTrack to be next object
				setActiveTrack(cartArray[activeProgramNumber][index + 1]);
			}

			activeTime.current += 1;

			console.log('activeTime.current: ', activeTime.current);
			console.log('Last activeTrack: ', activeTrack);

		}, 1)

		return () => clearInterval(intervalRef.current);


	}, [cartArray, isCartPlaying, activeTrack, activeProgramNumber]);

	// Effect hook for when active program number is changed
	useEffect(() => {
		// Iterate through cartArray at new active program number
		// and determine which track correctly fits activeTime
		if (!activeCart || !cartArray) {
			return;
		}

		const newActiveTrack = cartArray[activeProgramNumber]
			.find( (track) => {
				return (
					track.start_timestamp <= activeTime.current &&
					track.end_timestamp >= activeTime.current
				)
			});

		setActiveTrack(newActiveTrack);

	}, [activeProgramNumber, cartArray, activeCart]);

	return (
		<Fragment>
			<div className='container'>
				<div className='main-wrapper'>
					{/*Empty 8-track player visual*/}
					{/*Inside of that: activeCart details, if present*/}
					{ activeCart && <p className='activeCart_details'>{activeCart.cart_name}</p>}
					<p className='playbackMessage'>{playbackMessage}</p>	
				</div>
				<button type='button' className={`playbackButton ${activeCart && isPlaybackActive && !playbackMessage ? 'active' : 'disabled'}`} onClick={handlePlayPause}>
					{ isCartPlaying ? 'PAUSE' : 'PLAY'}
				</button>
				<button type='button' className='playbackButton' onClick={handleProgramChange}>PROGRAM</button>
			</div>
		</Fragment>
	)

}