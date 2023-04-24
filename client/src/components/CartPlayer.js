// External imports
import { Fragment, useEffect, useRef, useState } from 'react';

export default function CartPlayer(props) {

	const activeCart = props.activeCart || null;

	console.log('Active cart:');
	console.log(activeCart);

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
		console.log(programNumber);

		activeTracksArray[i] = 	{
			audio: effects.FADE_IN,
			type: EFFECT,
			end_timestamp: FADE_IN_LENGTH_MS,
			next_spotify_track_index: 0,
			intra_track_fade_length_ms: activeCart ? parseInt(activeCart[programNumber].intra_track_fade_length_ms) : null
		}
	}

	console.log('Active track array:');
	console.log(activeTracksArray);

	const [isCartPlaying, setIsCartPlaying] = useState(false);
	const [activeProgram, setActiveProgram] = useState(1);

	const activeTime = useRef(0);
	const intervalRef = useRef(null);
	const activeTracks = useRef(activeTracksArray);
		/*
		([
		{
			audio: effects.FADE_IN,
			type: EFFECT,
			end_timestamp: FADE_IN_LENGTH_MS,
			next_spotify_track_index: activeCart ? 0 : null,
			intra_track_fade_length: activeCart ? activeCart.program1.intra_track_fade_length : null
		},
		{
			audio: effects.FADE_IN,
			type: EFFECT,
			end_timestamp: FADE_IN_LENGTH_MS,
			next_spotify_track_index: activeCart ? 0 : null,
			intra_track_fade_length: activeCart ? activeCart.program2.intra_track_fade_length : null
		},
		{
			audio: effects.FADE_IN,
			type: EFFECT,
			end_timestamp: FADE_IN_LENGTH_MS,
			next_spotify_track_index: activeCart ? 0 : null,
			intra_track_fade_length: activeCart ? activeCart.program3.intra_track_fade_length : null
		},
		{
			audio: effects.FADE_IN,
			type: EFFECT,
			end_timestamp: FADE_IN_LENGTH_MS,
			next_spotify_track_index: activeCart ? 0 : null,
			intra_track_fade_length: activeCart ? activeCart.program4.intra_track_fade_length : null
		}
	]);*/

	function handleCartridgePlay() {
		console.log(activeCart);
		setIsCartPlaying(true);
	}

	function handleCartridgePause() {
		setIsCartPlaying(false);
	}

	useEffect(() => {

		// Clear any existing timeout
		clearInterval(intervalRef.current);

		if (isCartPlaying) {

			console.log('Cart playing');

			intervalRef.current = setInterval(() => {
				//Every second, map over everything (at end of setInterval)
				console.log('Active time:');
				console.log(activeTime.current);
				console.log('Active tracks:');
				console.log(activeTracks.current);
				// If activeTime.current reached program length
				// (including program selector sound), reset all
				if (activeTime.current === LAST_TRACK_END_TIMESTAMP_MS + FADE_OUT_LENGTH_MS + PROGRAM_SELECTOR_LENGTH_MS) {
					console.log('Routine 0');
					activeTime.current = 0;
					activeTracks.current = activeTracksArray;
					
					/*
					[
						{
							audio: effects.FADE_IN,
							type: EFFECT,
							end_timestamp: FADE_IN_LENGTH_MS,
							next_spotify_track_index: 0,

						},
						{
							audio: effects.FADE_IN,
							type: EFFECT,
							end_timestamp: FADE_IN_LENGTH_MS
						},
						{
							audio: effects.FADE_IN,
							type: EFFECT,
							end_timestamp: FADE_IN_LENGTH_MS
						},
						{
							audio: effects.FADE_IN,
							type: EFFECT,
							end_timestamp: FADE_IN_LENGTH_MS
						}
					];*/
				}
				// If we've reached the end of the fade-out, set all
				// to player arm audio
				else if (activeTime.current === LAST_TRACK_END_TIMESTAMP_MS + FADE_OUT_LENGTH_MS) {
					console.log('Routine 1');
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
					console.log('Routine 2');
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

					console.log('Routine 3');
					// Map over all tracks
					activeTracks.current = activeTracks.current.map ( (program, index) => {
						const programNumber = 'program'.concat(index + 1);
						// If activeTime.current === program.end_timestamp for any...
						if (activeTime.current === program.end_timestamp) {
							console.log('Routine 3a');
							// If that track is of type Spotify song and there's an inter-track fade length, switch to that
							if (program.type === SPOTIFY_TRACK && program.intra_track_fade_length_ms > 0) {
								console.log('Routine 3a1');
								return ({
									...program,
									audio: effects.INTRA_TRACK_FADE,
									type: EFFECT,
									end_timestamp: program.end_timestamp + program.intra_track_fade_length_ms
								})
							}
							// Otherwise...
							else {
								console.log('Routine 3a2');
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

				console.log('activeTracks.current at end of routine:');
				console.log(activeTracks.current);

				activeTime.current = activeTime.current + 1;
			}, 1);

			/*
			else {

				// Set the four "active" tracks for each program 
				// based on intervalRef.current
				activeTracks.current.map( (program) => {
					if (activeTime.current === program.end_timestamp) {
						// If we've reached the end of the program (minus transition),
						// set all programs to the selector arm noise

						// If it's a Spotify track and there is inter-track fade time,
						// change to that

						// If it's a Spotify track and there's no fade time, or it's an
						// effect, switch to that

						// If 



					}
				})

				intervalRef.current = setInterval(() => {
					activeTime.current = activeTime.current + 1;
				}, 1);
			}
			*/
		}
		else {
			console.log('Cart not playing');
		}

	}, [isCartPlaying, activeProgram]);

	// Clear any existing timeouts upon re-render
	useEffect(() => {
		return () => clearInterval(intervalRef.current);
	}, []);

	return (
		<Fragment>
			<button type="button" onClick={handleCartridgePlay}>Play</button>
			<button type="button" onClick={handleCartridgePause}>Pause</button>
		</Fragment>
	)

}