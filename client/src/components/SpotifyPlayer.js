// External imports
import {
	Fragment,
	useCallback,
	useEffect,
	useRef,
	useState
} from 'react';

// Internal imports
import {
	usePrevious
} from '../customHooks/usePrevious.js';

export default function SpotifyPlayer(props) {

	const SPOTIFY_TRACK = 'SPOTIFY_TRACK';

	const activeCart = props.activeCart;
	const setSpotifyStatus = props.setSpotifyStatus;
	const setTrackChangeEventQueue = props.setTrackChangeEventQueue;

	const spotifyUserAuthToken = props.spotifyUserAuthToken;
	const activeTrack = props.activeTrack;
	const isCartPlaying = props.isCartPlaying;
	const SPOTIFY_STATUSES = props.SPOTIFY_STATUSES;
	const TRACK_EVENT_TYPES = props.TRACK_EVENT_TYPES;
	const cartTimestamp = props.cartTimestamp;

	const [isPlaybackActive, setIsPlaybackActive] = useState(false);
	const [activeSpotifyAudio, setActiveSpotifyAudio] = useState(null);
	const [deviceId, setDeviceId] = useState(null);

	const spotifyPlayer = useRef(null);
	// const deviceId = useRef(null);

	// To delete and rework
	const [isSpotifyTrackEnded, setIsSpotifyTrackEnded] = useState(null);

	// Constants for testing
	const TEST_START_TIMESTAMP_MS = 0;

	// Function for handling new play (i.e., connection via Spotify)
	const startSpotifyPlayback = useCallback(async (track, cartTimestamp) => {

		const uri = track.audio;
		const startTime = cartTimestamp - track.start_timestamp + 1;

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
			else {
				return uri;
			}
		}
		catch (err) {
			console.error('Error while initiating Spotify playback: ', err);
		}
	}, [spotifyUserAuthToken]);

	// Function for fetching Spotify player state via SDk
	const getSpotifyPlayerState = useCallback( async() => {
		try {
			const state = await spotifyPlayer.current.getCurrentState();
			if (!state) {
				console.error('Error while obtaining Spotify player state: music not currently playing through SDK');
				return;
			}
			else {
				console.log('State from fetch function: ', state);
				return state;
			}
		}
		catch (err) {
			console.error('Error while obtaining Spotify player state: ', err);
		}
	}, [])

	// Function for calculating overall cart timestamp using track position
	const getCartTimestamp = useCallback((track) => {
		getSpotifyPlayerState()
			.then( (state) => {
				return track.start_timestamp + state.position;
			})
	}, []);

	const handleTrackEnd = useCallback(() => {

		// Calculate cartTimestamp
		console.log('aT inside handleTrackEnd: ', activeTrack);
		const newCartTimestamp = getCartTimestamp(activeTrack);

		// Emit a track end 'event'
		console.log('Emitting track change event from Spotify player');
		setTrackChangeEventQueue( (prev) => {
			return ([
				...prev,
				{
					activeTrack: activeTrack,
					cartTimestamp: newCartTimestamp,
					type: TRACK_EVENT_TYPES.TRACK_END
				}
			])
		});

	}, [activeTrack, getCartTimestamp, setTrackChangeEventQueue, TRACK_EVENT_TYPES.TRACK_END]);

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
			// setPlayer(player);
	
			spotifyPlayer.current.addListener('ready', ({ device_id }) => {
				console.log('Ready with Device ID', device_id);
				setDeviceId(device_id);
			});
		
			spotifyPlayer.current.addListener('not_ready', ({ device_id }) => {
				console.log('Device ID has gone offline', device_id);
			});
		
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

			// Listener for track end, taken from comment at 
			// https://github.com/spotify/web-playback-sdk/issues/35
			spotifyPlayer.current.addListener('player_state_changed', (state) => {

				if (
					state
					&& state.track_window.previous_tracks.find(x => x.id === state.track_window.current_track.id)
					&& state.paused
				) {
					console.log('Track ended');
					// setIsSpotifyTrackEnded(true);
					console.log('aT inside end listener: ', activeTrack);
					handleTrackEnd();

				}

			});
	
			spotifyPlayer.current.on('playback_error', ({message}) => {
				console.error('Failed to perform playback', message);
			})
	
			spotifyPlayer.current.connect();
		
		};
	
	}, [spotifyUserAuthToken, setSpotifyStatus]);

	// Function to transfer playback to local context
	useEffect(() => {

		console.log('Initiating transfer playback hook');

		async function transferPlayback() {

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
							case 502:
								setSpotifyStatus(SPOTIFY_STATUSES.ERROR);
								break;
							case 429:
								setSpotifyStatus(SPOTIFY_STATUSES.RATE_LIMITS);
								break;
							default:
								setSpotifyStatus(SPOTIFY_STATUSES.ERROR);
								break;
						}
					}
				}
				else {
					console.log('Fetched successfully');
					setSpotifyStatus(SPOTIFY_STATUSES.CONNECTED);
					setIsPlaybackActive(true);
				}
			}
			catch (err) {
				console.error('Error while transferring Spotify playback: ', err);
				setSpotifyStatus(SPOTIFY_STATUSES.ERROR);
			}

		}

		if (activeCart && deviceId && !isPlaybackActive) {
			// TESTING
			console.log('Transferring playback');
			transferPlayback();
			console.log('Transferred playback');
		}

	}, [activeCart, deviceId, isPlaybackActive, SPOTIFY_STATUSES.CONNECTED, SPOTIFY_STATUSES.ERROR, SPOTIFY_STATUSES.RATE_LIMITS, spotifyUserAuthToken, setSpotifyStatus]);

	// Util function for calculating activeTime?

	// Spotify playback initialization handler
	useEffect(() => {

		// If there is no activeTrack or cart isn't playing, return
		if (!activeTrack || !isCartPlaying) {
			return;
		}

		// Otherwise, if activeTrack is of type Spotify...
		else if (activeTrack.type === SPOTIFY_TRACK) {

			// Fetch new (via function)
			startSpotifyPlayback(activeTrack, cartTimestamp)
				.then( (uri) => {
					setActiveSpotifyAudio(uri);
				});
		}

	}, [activeTrack, isCartPlaying, cartTimestamp, startSpotifyPlayback])

	// Spotify play and pause handler
	useEffect(() => {

		// If no activeTrack, return
		if (!activeTrack || !deviceId || !activeSpotifyAudio) {
			return;
		}

		// If isCartPlaying is true, execute play
		else if (isCartPlaying && activeTrack.type === SPOTIFY_TRACK) {
			console.log('activeTrack: ', activeTrack);
			spotifyPlayer.current.resume();
		}
		// If isCartPlaying is false, execute pause
		else if (activeTrack.type === SPOTIFY_TRACK) {
			console.log('activeTrack: ', activeTrack);
			spotifyPlayer.current.pause();
		}

	}, [isCartPlaying, activeTrack, deviceId, isCartPlaying, activeSpotifyAudio])

	// Spotify track end handler, where on end, could it launch a callback? Except the event often occurs multiple times...

	// What if we emitted an "event" on end that set a piece of state higher up?
		// Also emit current timestamps


	return (
		<h1>Placeholder for SpotifyPlayer</h1>
	)
}