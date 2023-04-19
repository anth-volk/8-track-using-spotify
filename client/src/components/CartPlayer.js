// External imports
import { Fragment, useEffect, useRef, useState } from 'react';

export default function CartPlayer(props) {

	const activeCart = props.activeCart;

	const FADE_IN_TIMESTAMP_MS = 0;
	const FIRST_TRACK_START_TIMESTAMP_MS = 2001;

	const FADE_IN_LENGTH_MS = 2000;
	const FADE_OUT_LENGTH_MS = 2000;
	const PROGRAM_SELECTOR_LENGTH_MS = 0;

	const LAST_TRACK_END_TIMESTAMP_MS = activeCart.program1.program_length_ms + FADE_IN_LENGTH_MS;

	const EFFECT = 'EFFECT';
	const SPOTIFY_TRACK = 'SPOTIFY_TRACK';

	const effects = {
		FADE_IN: 'FADE_IN',
		FADE_OUT: 'FADE_OUT',
		INTRA_TRACK_FADE: 'INTRA_TRACK_FADE',
		PROGRAM_SELECTOR: 'PROGRAM_SELECTOR'
	}

	const [isCartPlaying, setIsCartPlaying] = useState(false);
	const [activeProgram, setActiveProgram] = useState(1);

	const activeTime = useRef(0);
	const intervalRef = useRef(null);
	const activeTracks = useRef([
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
		},
		{
			audio: effects.FADE_IN,
			type: EFFECT,
			end_timestamp: FADE_IN_LENGTH_MS
		}
	]);
	
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

			/*
			Every second, map over everything

			If we've reached the end of the player arm audio, 
			reset all, including the intervalRef

			If we've reached the end of the fade-out, set all
			to player arm audio

			If we've reached the last-track timestamp, set all 
			to fade-out audio

			Otherwise...

				Map over all tracks

				If activeTime.current === program.end_timestamp for any...
					
					If that track is of type Spotify song and there's an inter-track fade length, switch to that

					Otherwise...

						Switch to next Spotify track	
						Load track using Spotify ID



			*/



			// If activeTime.current reached program length
			// (including program selector sound), reset all
			if (activeTime.current === LAST_TRACK_END_TIMESTAMP_MS + PROGRAM_SELECTOR_LENGTH_MS) {

				activeTime.current = 0;
				activeTracks.current = [
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
					},
					{
						audio: effects.FADE_IN,
						type: EFFECT,
						end_timestamp: FADE_IN_LENGTH_MS
					}
				];
			}
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