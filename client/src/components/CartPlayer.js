// External imports
import { useEffect, useRef, useState } from 'react';

// Internal imports
import WebPlayback from './WebPlayback.js';

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
			end_timestamp: FADE_IN_LENGTH_MS,
			next_spotify_track_index: 0,
			intra_track_fade_length_ms: activeCart ? parseInt(activeCart[programNumber].intra_track_fade_length_ms) : null
		}
	}

	const [isCartPlaying, setIsCartPlaying] = useState(false);
	const [activeProgram, setActiveProgram] = useState(1);

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

	return (
		<WebPlayback authToken={spotifyUserAuthToken}/>
	)

}