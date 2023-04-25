// External imports
import { Fragment, useEffect, useRef, useState } from 'react';
import { useCookies } from 'react-cookie';

export default function CartPlayer(props) {

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
			end_timestamp: FADE_IN_LENGTH_MS,
			next_spotify_track_index: 0,
			intra_track_fade_length_ms: activeCart ? parseInt(activeCart[programNumber].intra_track_fade_length_ms) : null
		}
	}

	const [isCartPlaying, setIsCartPlaying] = useState(false);
	const [activeProgram, setActiveProgram] = useState(1);

	const track = {
		name: "",
		album: {
			images: [
				{ url: "" }
			]
		},
		artists: [
			{ name: "" }
		]
	}

	const [player, setPlayer] = useState(null);
	const [isPaused, setIsPaused] = useState(false);
	const [isPlaybackActive, setIsPlaybackActive] = useState(false);
	const [currentTrack, setCurrentTrack] = useState(track);
	const [deviceId, setDeviceId] = useState(null);

	const [cookies, setCookie, removeCookie] = useCookies();

	const spotifyAccessToken = cookies.userSpotifyAuth.access_token;

	const activeTime = useRef(0);
	const intervalRef = useRef(null);
	const activeTracks = useRef(activeTracksArray);

	function handleCartridgePlay() {
		setIsCartPlaying(true);
	}

	function handleCartridgePause() {
		setIsCartPlaying(false);
	}

	useEffect(() => {

		// Clear any existing timeout
		clearInterval(intervalRef.current);

		if (isCartPlaying) {

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

			intervalRef.current = setInterval(() => {
				//Every second, map over everything (at end of setInterval)

				// If activeTime.current reached program length
				// (including program selector sound), reset all
				if (activeTime.current === LAST_TRACK_END_TIMESTAMP_MS + FADE_OUT_LENGTH_MS + PROGRAM_SELECTOR_LENGTH_MS) {
					activeTime.current = 0;
					activeTracks.current = activeTracksArray;
					
				}
				// If we've reached the end of the fade-out, set all
				// to player arm audio
				else if (activeTime.current === LAST_TRACK_END_TIMESTAMP_MS + FADE_OUT_LENGTH_MS) {
					activeTracks.current = activeTracks.current.map( (program) => {
						return ({
							...program,
							audio: effects.PROGRAM_SELECTOR,
							type: EFFECT,
							end_timestamp: program.end_timestamp + PROGRAM_SELECTOR_LENGTH_MS
						});
					})
				}
				// If we've reached the last-track timestamp, set all 
				// to fade-out audio
				else if (activeTime.current === LAST_TRACK_END_TIMESTAMP_MS) {
					activeTracks.current = activeTracks.current.map( (program) => {
						return ({
							...program,
							audio: effects.FADE_OUT,
							type: EFFECT,
							end_timestamp: program.end_timestamp + FADE_OUT_LENGTH_MS
						});
					})
				}
				// Otherwise...
				else {

					// Map over all tracks
					activeTracks.current = activeTracks.current.map ( (program, index) => {
						const programNumber = 'program'.concat(index + 1);
						// If activeTime.current === program.end_timestamp for any...
						if (activeTime.current === program.end_timestamp) {
							// If that track is of type Spotify song and there's an inter-track fade length, switch to that
							if (program.type === SPOTIFY_TRACK && program.intra_track_fade_length_ms > 0) {
								return ({
									...program,
									audio: effects.INTRA_TRACK_FADE,
									type: EFFECT,
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
				}

				activeTime.current = activeTime.current + 1;
			}, 1);

		}

	}, [isCartPlaying, activeProgram]);

	// Clear any existing timeouts upon re-render
	useEffect(() => {
		return () => clearInterval(intervalRef.current);
	}, []);

	// Spotify SDK hook
	useEffect(() => {

		const script = document.createElement("script");
		script.src = "https://sdk.scdn.co/spotify-player.js";
		script.async = true;
	
		document.body.appendChild(script);
	
		window.onSpotifyWebPlaybackSDKReady = () => {
	
			const player = new window.Spotify.Player({
				name: 'Web Playback SDK',
				getOAuthToken: cb => { cb(spotifyAccessToken); },
				volume: 0.5
			});

			setPlayer(player);

			player.addListener('ready', ({ device_id }) => {
				console.log('Ready with Device ID', device_id);
				setDeviceId(device_id);
			});
	
			player.addListener('not_ready', ({ device_id }) => {
				console.log('Device ID has gone offline', device_id);
			});
	
			player.addListener('player_state_changed', ( state => {

                if (!state) {
                    return;
                }

                setCurrentTrack(state.track_window.current_track);
                setIsPaused(state.paused);

                player.getCurrentState().then( state => { 
                    (!state)? setIsPlaybackActive(false) : setIsPlaybackActive(true) 
                });

            }));

			player.on('playback_error', ({message}) => {
				console.error('Failed to perform playback', message);
			})

			player.connect();
	
		};

	}, []);

	useEffect(() => {

		async function transferPlayback() {

			await fetch('https://api.spotify.com/v1/me/player', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': 'Bearer ' + cookies.userSpotifyAuth.access_token
				},
				body: JSON.stringify({
					device_ids: [
						deviceId
					],
					play: true
				})
			});

		}

		if (deviceId) {
			transferPlayback();
		}

	}, [deviceId])

	if (!isPlaybackActive) { 
        return (
            <>
                <div className="container">
                    <div className="main-wrapper">
                        <b> Instance not active. Transfer your playback using your Spotify app </b>
                    </div>
                </div>
            </>)
    } else {
        return (
            <>
                <div className="container">
                    <div className="main-wrapper">

                        <img src={currentTrack.album.images[0].url} className="now-playing__cover" alt="" />

                        <div className="now-playing__side">
                            <div className="now-playing__name">{currentTrack.name}</div>
                            <div className="now-playing__artist">{currentTrack.artists[0].name}</div>

                            <button className="btn-spotify" onClick={() => { player.previousTrack() }} >
                                &lt;&lt;
                            </button>

                            <button className="btn-spotify" onClick={() => { player.togglePlay() }} >
                                { isPaused ? "PLAY" : "PAUSE" }
                            </button>

                            <button className="btn-spotify" onClick={() => { player.nextTrack() }} >
                                &gt;&gt;
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

	/*
	return (
		<Fragment>
			<button type="button" onClick={handleCartridgePlay}>Play</button>
			<button type="button" onClick={handleCartridgePause}>Pause</button>
		</Fragment>
	)
	*/

}