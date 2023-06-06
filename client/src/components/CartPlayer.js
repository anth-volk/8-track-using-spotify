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
	getCartTimestampSpotify,
	startSpotifyPlayback
} from '../utilities/spotifyPlayback.js';

import {
	handlePlayPauseLocal,
	handleTrackEndLocal,
	getCartTimestampLocal,
	startLocalPlayback
} from '../utilities/localPlayback.js';

// Local audio imports
import tapeHiss from '../audio_files/tape_hiss.mp3';
import programClick from '../audio_files/program_click.mp3';

export default function CartPlayer(props) {

	// Props
	const setActiveCart = props.setActiveCart;
	const spotifyToken = props.spotifyToken || null;
	const activeCart = props.activeCart || null;

	// Audio refs
	const tapeHissRef = useRef(null);
	const programClickRef = useRef(null);

	// Playback constants
	const NUMBER_OF_PROGRAMS = 4;
	const FADE_IN_TIMESTAMP_MS = 0;
	const FADE_IN_LENGTH_MS = 2000;
	const FADE_OUT_LENGTH_MS = 2000;
	// const PROGRAM_SELECTOR_LENGTH_MS = programClickRef.duration * 1000;
	const EFFECT = 'EFFECT';
	const SPOTIFY_TRACK = 'SPOTIFY_TRACK';

	// Object of effects
	const effects = {
		FADE_IN: tapeHissRef.current,
		FADE_OUT: tapeHissRef.current,
		INTRA_TRACK_FADE: tapeHissRef.current,
		PROGRAM_SELECTOR: programClickRef.current
	}

	// State for overall playback
	const [cartArray, setCartArray] = useState(null);
	const [activeTrack, setActiveTrack] = useState(null);
	const [activeProgramNumber, setActiveProgramNumber] = useState(0);
	const [isCartPlaying, setIsCartPlaying] = useState(false);
	const [playbackMessage, setPlaybackMessage] = useState('');
	const cartTimestamp = useRef(0);
	const trackIndex = useRef(0);
	const lastTrackEndAudio = useRef(null);

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

	// Signals for cancelling event listeners
	const localCancelController = new AbortController();
	const { signal: localCancelSignal } = localCancelController;

	function calculateProgramNumber(currentProgramNumber) {
		const newProgramNumber = currentProgramNumber === NUMBER_OF_PROGRAMS - 1
			? 0
			: currentProgramNumber + 1

		return newProgramNumber
	}

	function handleCartridgeEjection() {
		setActiveCart(null);
	}

	function handleTrackChange() {
		// If track is of type Spotify...
		if (activeTrack.type === SPOTIFY_TRACK) {

			startSpotifyPlayback(activeTrack, cartTimestamp.current, deviceId, spotifyToken)
				.then((playbackState) => {
					setIsActiveSpotifyAudio(playbackState);
				});
		}
		// Else, if track is local effect...
		else if (activeTrack.type === EFFECT) {
			localAudioRef.current = activeTrack.audio;

			const playbackObject = startLocalPlayback(activeTrack, localAudioRef.current, cartTimestamp.current);
			localFileLength.current = playbackObject.fileLength;
			localRemainingPlayLength.current = playbackObject.playLength;
			setIsActiveLocalAudio(playbackObject.playbackState);

		}
	}

	function handlePlayPause() {

		// If there is no deviceId, do nothing
		if (!deviceId || !cartArray) {
			return;
		}

		// If there is no active track, set it
		if (!activeTrack) {
			setActiveTrack(cartArray[activeProgramNumber][0]);
		}
		// Otherwise, handle play and pause
		else {
			if (activeTrack.type === SPOTIFY_TRACK) {
				handlePlayPauseSpotify(spotifyPlayer.current, isCartPlaying);
			}
			else if (activeTrack.type === EFFECT) {
				handlePlayPauseLocal(localAudioRef.current, isCartPlaying);
			}

		}
		setIsCartPlaying((prev) => !prev);

	}

	async function handleProgramChange() {

		// Set new program number
		const newProgramNumber = calculateProgramNumber(activeProgramNumber);

		// Set new activeProgramNumber
		setActiveProgramNumber(newProgramNumber);

		// Play program switch audio
		if (programClickRef.current) {
			programClickRef.current.currentTime = 0;
			programClickRef.current.play();
		}

		if (activeTrack && isCartPlaying) {

			let newCartTimestamp = 0;

			// Based on activeTrack type, get current cart timestamp
			// Afterward, end current track
			if (activeTrack.type === SPOTIFY_TRACK) {
				newCartTimestamp = await getCartTimestampSpotify(activeTrack, spotifyPlayer.current, false);
				cartTimestamp.current = newCartTimestamp;

				spotifyPlayer.current.pause();
				setIsActiveSpotifyAudio(false);

			}
			else {
				newCartTimestamp = getCartTimestampLocal(activeTrack, localAudioRef.current, localRemainingPlayLength.current);
				cartTimestamp.current = newCartTimestamp;

				localAudioRef.current.pause();
				localAudioRef.current.currentTime = 0;
				localCancelController.abort();
				setIsActiveLocalAudio(false);
			}

			// Find new activeTrack
			const newTrack = cartArray[newProgramNumber].find((track) => {
				return (
					track.start_timestamp <= cartTimestamp.current &&
					track.end_timestamp >= cartTimestamp.current
				);
			});

			// Find index of this track
			const newTrackIndex = cartArray[newProgramNumber].findIndex((element) => {
				return element.start_timestamp === newTrack.start_timestamp;
			});

			// Set new index
			trackIndex.current = newTrackIndex;

			// Set new activeTrack
			setActiveTrack(newTrack);

		}

	}

	const checkPlaybackEndLocal = useCallback(() => {
		const playbackObject = handleTrackEndLocal(
			activeTrack,
			localAudioRef.current,
			localFileLength.current,
			localRemainingPlayLength.current
		);

		if (playbackObject.playbackState === false) {

			setIsActiveLocalAudio(false);
			// If we've reached end of program...
			if (trackIndex.current + 1 === cartArray[activeProgramNumber].length) {
				trackIndex.current = 0;
				const newProgramNumber = calculateProgramNumber(activeProgramNumber);
				setActiveTrack(cartArray[newProgramNumber][0]);
				setActiveProgramNumber(newProgramNumber);

				// Play program switch audio
				if (programClickRef.current) {
					programClickRef.current.currentTime = 0;
					programClickRef.current.play();
				}

			}
			else {
				trackIndex.current = trackIndex.current + 1;
				lastTrackEndAudio.current = activeTrack.audio;
				setActiveTrack(cartArray[activeProgramNumber][trackIndex.current]);
			}

		}
		else {
			localFileLength.current = playbackObject.fileLength;
			localRemainingPlayLength.current = playbackObject.remainingPlayLength;
		}

		cartTimestamp.current = playbackObject.cartTimestamp;
	}, [activeProgramNumber, activeTrack, cartArray]);

	const checkPlaybackEndSpotify = useCallback(async (state) => {
		if (
			state
			&& state.track_window.previous_tracks.find(x => x.id === state.track_window.current_track.id)
			&& state.paused
			&& state.track_window.current_track.id === activeTrack.audio
		) {
			cartTimestamp.current = await getCartTimestampSpotify(activeTrack, spotifyPlayer.current, true);
			// This check is necessary because the track end handler inexplicably fires at least twice,
			// as documented elsewhere in Spotify developer forums
			if (lastTrackEndAudio.current !== activeTrack.audio) {
				trackIndex.current += 1;
				lastTrackEndAudio.current = activeTrack.audio;
				setActiveTrack(cartArray[activeProgramNumber][trackIndex.current]);
			}

		}
	}, [activeProgramNumber, activeTrack, cartArray])

	const transferSpotifyPlayback = useCallback(async (deviceId) => {
		try {
			const fetchResponseRaw = await fetch('https://api.spotify.com/v1/me/player', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': 'Bearer ' + spotifyToken
				},
				body: JSON.stringify({
					device_ids: [
						deviceId
					],
					play: false
				})
			});
			if (!fetchResponseRaw.ok) {
				console.error('Error while fetching Spotify playback');
				const fetchResponseJSON = await fetchResponseRaw.json();
				if (fetchResponseJSON && fetchResponseJSON.error && fetchResponseJSON.error.status) {
					switch (fetchResponseJSON.error.status) {
						case 429:
							return 'Exceeded Spotify API rate limits; please try again in 30+ seconds.';
						case 502:
						default:
							return 'Error while connecting Spotify player; please try again later.';
					}
				}
			}
			else {
				setIsSpotifyReady(true);
				return '';
			}
		}
		catch (err) {
			console.error('Error while transferring Spotify playback: ', err);
			return 'Error while connecting Spotify player; please try again later.';
		}

	}, [spotifyToken])

	// Spotify SDK hook
	useEffect(() => {

		const script = document.createElement("script");
		script.src = "https://sdk.scdn.co/spotify-player.js";
		script.async = true;

		document.body.appendChild(script);

		window.onSpotifyWebPlaybackSDKReady = () => {

			const playerConstructor = new window.Spotify.Player({
				name: 'STEREO 8s',
				getOAuthToken: cb => { cb(spotifyToken); },
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

			spotifyPlayer.current.on('playback_error', ({ message }) => {
				console.error('Failed to perform playback', message);
				setPlaybackMessage('Error while connecting with Spotify. Please try again later.');
			})

			spotifyPlayer.current.connect();

		};

	}, [spotifyToken]);

	// Effect hook for transferring Spotify playback
	useEffect(() => {
		if (activeCart && deviceId) {
			setPlaybackMessage('Connecting with Spotify, please wait...');
			transferSpotifyPlayback(deviceId)
				.then((message) => {
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

			// Calculate program selector length here to ensure audio ref is fully loaded
			const programSelectorLengthMS = programClickRef.current.duration * 1000;

			/*
			programArray = [
				...programArray,
				{
					audio: effects.PROGRAM_SELECTOR,
					type: EFFECT,
					length: programSelectorLengthMS,
					start_timestamp: startTimestamp,
					end_timestamp: startTimestamp + programSelectorLengthMS
				}
			];
			*/

			// Finally, concat finished programArray to cartArray
			cartArrayTemp = [
				...cartArrayTemp,
				programArray
			];
		};

		// Set this array as state
		setCartArray(cartArrayTemp);

	}, [activeCart, effects.FADE_IN, effects.INTRA_TRACK_FADE, effects.FADE_OUT, effects.PROGRAM_SELECTOR]);

	// Effect hook for changes to active track
	useEffect(() => {

		if (!activeTrack || !isCartPlaying) {
			return;
		}

		handleTrackChange();

	}, [activeTrack])

	// Effect hook to create event listener for local track end
	useEffect(() => {
		if (isActiveLocalAudio) {
			// Create listener for local track end

			localAudioRef.current.addEventListener('ended', (event) => {
				checkPlaybackEndLocal();
			}, { signal: localCancelSignal, once: true });

		}
	}, [isActiveLocalAudio, checkPlaybackEndLocal])

	// Effect hook to create listener for Spotify track end
	useEffect(() => {

		if (deviceId
			&& activeTrack
			&& activeTrack.type === SPOTIFY_TRACK
		) {

			// Listener for track end, taken from comment at 
			// https://github.com/spotify/web-playback-sdk/issues/35
			spotifyPlayer.current.addListener('player_state_changed', (state) => {

				checkPlaybackEndSpotify(state);

			});

		}

		return () => {
			spotifyPlayer.current.removeListener('player_state_changed', (state) => {
				checkPlaybackEndSpotify(state);
			});
		}

	}, [deviceId, activeTrack, checkPlaybackEndSpotify]);

	return (
		<Fragment>
			<p className='playbackMessage'>{playbackMessage}</p>
			<section className="CartPlayer">
				<div className="CartPlayer_middle">
					<div className="CartPlayer_inner">
						<div className="CartPlayer_progLightContainer">
							<div className={`CartPlayer_progLight ${activeProgramNumber === 0 ? 'progLight_active' : ''}`}>1</div>
							<div className={`CartPlayer_progLight ${activeProgramNumber === 1 ? 'progLight_active' : ''}`}>2</div>
							<div className={`CartPlayer_progLight ${activeProgramNumber === 2 ? 'progLight_active' : ''}`}>3</div>
							<div className={`CartPlayer_progLight ${activeProgramNumber === 3 ? 'progLight_active' : ''}`}>4</div>
						</div>
						<div className="CartPlayer_playbackContainer">
							<div className='CartPlayer_tapeSlot'>
								{!activeCart && <p className="CartPlayer_tapeSlotText">STEREO 8-TRACK</p>}
								{activeCart && (
									<div className="CartPlayer_shadow">
										<div className="CartPlayer_albumPlastic" onClick={handleCartridgeEjection}>
											<div className="CartPlayer_album">
												<p className="CartPlayer_album_artists">{activeCart.artists_array[0]}</p>
												<p className="CartPlayer_album_title">{activeCart.cart_name}</p>
											</div>
										</div>
									</div>
								)}
							</div>
							<div className="CartPlayer_buttonContainer">
								<div className="CartPlayer_buttonAndDesc">
									<button type='button' className={`playbackButton ${isSpotifyReady ? 'active' : 'disabled'}`} onClick={handlePlayPause}>
									</button>
									<p className="CartPlayer_bottomText">
										{isCartPlaying ? 'PAUSE' : 'PLAY'}
									</p>
								</div>
								<div className="CartPlayer_buttonAndDesc">
									<button type='button' className='programButton' onClick={handleProgramChange}></button>
									<p className="CartPlayer_bottomText">PROGRAM</p>
								</div>
							</div>
							<div className='audioElements'>
								<audio src={tapeHiss} ref={tapeHissRef} />
								<audio src={programClick} ref={programClickRef} />
							</div>
						</div>
						<div className="CartPlayer_bottomContainer">
							<p className="CartPlayer_bottomText bottomText_copyright">JavaSonic</p>
						</div>
					</div>
				</div>
			</section>
		</Fragment>
	)
}