// External imports
import {
	Fragment,
	useEffect,
	useRef,
	useState
} from 'react';

export default function SpotifyPlayer(props) {

	const setIsSpotifyActive = props.setIsSpotifyActive;
	const spotifyUserAuthToken = props.spotifyUserAuthToken;

	const spotifyPlayer = useRef(null);
	const deviceId = useRef(null);

	// To delete and rework
	const [isSpotifyTrackEnded, setIsSpotifyTrackEnded] = useState(null);

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
	
				spotifyPlayer.current.getCurrentState().then( state => { 
					(!state)? setIsSpotifyActive(false) : setIsSpotifyActive(true) 
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
					setIsSpotifyTrackEnded(true);

				}

			});
	
			spotifyPlayer.current.on('playback_error', ({message}) => {
				console.error('Failed to perform playback', message);
			})
	
			spotifyPlayer.current.connect();
		
		};
	
	}, [spotifyUserAuthToken, setIsSpotifyActive]);

	// Util function for calculating activeTime

	// Spotify track play and pause handler, based on isCartPlaying & program number (& activeTrack?)
	// Will need to be generalizable

	// Spotify track end handler, where on end, could it launch a callback? Except the event often occurs multiple times...

	// What if we emitted an "event" on end that set a piece of state higher up?


	return (
		<h1>Placeholder for SpotifyPlayer</h1>
	)
}