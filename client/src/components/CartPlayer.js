// External imports
import { Fragment, useEffect, useRef, useState } from 'react';

export default function CartPlayer(props) {

	const spotifyUserAuthToken = props.authToken || null;
	const activeCart = props.activeCart || null;

	const NUMBER_OF_PROGRAMS = 4;

	const FADE_IN_TIMESTAMP_MS = 0;
	const FIRST_TRACK_START_TIMESTAMP_MS = 2001;

	const FADE_IN_LENGTH_MS = 2000;
	const FADE_OUT_LENGTH_MS = 2000;
	const PROGRAM_SELECTOR_LENGTH_MS = 0;

	const LAST_TRACK_END_TIMESTAMP_MS = activeCart
		? activeCart.program1.program_length_ms + FADE_IN_LENGTH_MS
		: null;

	const EFFECT = 'EFFECT';
	const SPOTIFY_TRACK = 'SPOTIFY_TRACK';

	const effects = {
		FADE_IN: 'FADE_IN',
		FADE_OUT: 'FADE_OUT',
		INTRA_TRACK_FADE: 'INTRA_TRACK_FADE',
		PROGRAM_SELECTOR: 'PROGRAM_SELECTOR'
	}

	const activeTracksArray = new Array(NUMBER_OF_PROGRAMS);
	for (let i = 0; i < activeTracksArray.length; i++) {
		const programNumber = 'program'.concat(i + 1);

		activeTracksArray[i] = 	{
			audio: effects.FADE_IN,
			type: EFFECT,
			length: FADE_IN_LENGTH_MS,
			end_timestamp: FADE_IN_LENGTH_MS,
			next_spotify_track_index: 0,
			intra_track_fade_length_ms: activeCart ? parseInt(activeCart[programNumber].intra_track_fade_length_ms) : null
		}
	}

	const [isCartPlaying, setIsCartPlaying] = useState(false);
	// Note that activeProgram will select 0-3; when rendered, if the actual
	// number is needed, it is imperative to add 1
	const [activeProgram, setActiveProgram] = useState(0);
	const [playingAudio, setPlayingAudio] = useState(null);

	const [isPaused, setIsPaused] = useState(false);
	const [isPlaybackActive, setIsPlaybackActive] = useState(false);
	const [currentTrack, setCurrentTrack] = useState(null);
	const [playbackMessage, setPlaybackMessage] = useState('');

	const activeTime = useRef(0);
	const intervalRef = useRef(null);
	const activeTracks = useRef(activeTracksArray);

	const spotifyPlayer = useRef(null);
	const deviceId = useRef(null);

	function handlePlayPause() {
		if (activeCart) {
			setIsCartPlaying(prev => !prev);
		}
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
	
	}, []);

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
						play: false
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

	useEffect(() => {

		// Clear any existing timeout
		clearInterval(intervalRef.current);

		if (isCartPlaying) {

			// Add intra track fade lengths to tracks object
			activeTracks.current = activeTracks.current.map( (program, index) => {
				const programNumber = 'program'.concat(index + 1);
				if (!program.intra_track_fade_length_ms) {
					return ({
						...program,
						intra_track_fade_length_ms: parseInt(activeCart[programNumber].intra_track_fade_length_ms)
					})
				}
				else {
					return program;
				}
			});
			setPlayingAudio(activeTracks.current[activeProgram]);

			//Every second, map over everything (at end of setInterval)
			intervalRef.current = setInterval(() => {

				// If activeTime.current reached program length
				// (including program selector sound), reset all
				if (activeTime.current === LAST_TRACK_END_TIMESTAMP_MS + FADE_OUT_LENGTH_MS + PROGRAM_SELECTOR_LENGTH_MS) {
					activeTime.current = 0;
					activeTracks.current = activeTracksArray;
					setPlayingAudio(activeTracks.current[activeProgram]);
					
				}
				// If we've reached the end of the fade-out, set all
				// to player arm audio
				else if (activeTime.current === LAST_TRACK_END_TIMESTAMP_MS + FADE_OUT_LENGTH_MS) {
					activeTracks.current = activeTracks.current.map( (program) => {
						return ({
							...program,
							audio: effects.PROGRAM_SELECTOR,
							type: EFFECT,
							length: PROGRAM_SELECTOR_LENGTH_MS,
							end_timestamp: program.end_timestamp + PROGRAM_SELECTOR_LENGTH_MS
						});
					});
					setPlayingAudio(activeTracks.current[activeProgram]);
				}
				// If we've reached the last-track timestamp, set all 
				// to fade-out audio
				else if (activeTime.current === LAST_TRACK_END_TIMESTAMP_MS) {
					activeTracks.current = activeTracks.current.map( (program) => {
						return ({
							...program,
							audio: effects.FADE_OUT,
							type: EFFECT,
							length: FADE_OUT_LENGTH_MS,
							end_timestamp: program.end_timestamp + FADE_OUT_LENGTH_MS
						});
					});
					setPlayingAudio(activeTracks.current[activeProgram]);

				}
				// Otherwise...
				else {

					let currentProgramChanged = false;

					// Map over all tracks
					activeTracks.current = activeTracks.current.map ( (program, index) => {
						const programNumber = 'program'.concat(index + 1);
						// If activeTime.current === program.end_timestamp for any...
						if (activeTime.current === program.end_timestamp) {
							if (index === activeProgram) {
								currentProgramChanged = true;
							}
							// If that track is of type Spotify song and there's an inter-track fade length, switch to that
							if (program.type === SPOTIFY_TRACK && program.intra_track_fade_length_ms > 0) {
								return ({
									...program,
									audio: effects.INTRA_TRACK_FADE,
									type: EFFECT,
									length: program.intra_track_fade_length_ms,
									end_timestamp: program.end_timestamp + program.intra_track_fade_length_ms
								})
							}
							// Otherwise...
							else {
								// Switch to next Spotify track	
								// Load track using Spotify ID
								return ({
									...program,
									audio: activeCart[programNumber].tracks[program.next_spotify_track_index].spotify_track_id,
									type: SPOTIFY_TRACK,
									length: parseInt(activeCart[programNumber].tracks[program.next_spotify_track_index].duration_ms),
									end_timestamp: program.end_timestamp + parseInt(activeCart[programNumber].tracks[program.next_spotify_track_index].duration_ms),
									next_spotify_track_index: program.next_spotify_track_index === activeCart[programNumber].tracks.length ? 0 : program.next_spotify_track_index + 1
								});
							}
						}
						// Otherwise, return what was there before
						else {
							return ({
								...program
							})
						}
					})

					if (currentProgramChanged) {
						setPlayingAudio(activeTracks.current[activeProgram]);
					}
				}

				console.log('activeTime: ', activeTime.current);
				console.log('activeTracks.current: ', activeTracks.current);
				activeTime.current = activeTime.current + 1;

			}, 1);

		}

	}, [isCartPlaying, activeProgram]);

	useEffect(() => {
		setPlayingAudio(activeTracks.current[activeProgram]);
	}, [activeProgram]);

	useEffect(() => {

		console.log('Playing audio re-rendered');
		console.log(playingAudio);

		if (isCartPlaying && playingAudio) {
			// Calculate start timestamp
			const startingTime = activeTime.current - (playingAudio.end_timestamp - playingAudio.length);

			if (playingAudio.type === EFFECT) {
				// Play audio file of relevant effect audio
				return;
			}
			else {

				// Load song on Spotify
				startSpotifyPlayback(playingAudio.audio, startingTime);

				// Play song

			}
		}

	}, [playingAudio, isCartPlaying]);

	// Clear any existing timeouts upon re-render
	useEffect(() => {
		return () => clearInterval(intervalRef.current);
	}, []);

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
			</div>
		</Fragment>
	)

}