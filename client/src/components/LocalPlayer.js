// External imports
import {
	Fragment,
	useCallback,
	useEffect,
	useRef,
	useState
} from 'react';

// Internal imports
import tapeHiss from '../audio_files/tape_hiss.mp3';

export default function LocalPlayer(props) {

	const EFFECT = 'EFFECT';

	const setTrackChangeEvent = props.setTrackChangeEvent;

	const trackChangeEvent = props.trackChangeEvent;
	const activeTrack = props.activeTrack;
	const isCartPlaying = props.isCartPlaying;
	const TRACK_EVENT_TYPES = props.TRACK_EVENT_TYPES;

	const audioRef = useRef(null);
	const fileLengthRef = useRef(null);
	const remainingPlayLengthRef = useRef(null);

	// Local play start/stop handler based on isCartPlaying and program number (& activeTrack?)
	// Needs to somehow set up custom loop length while initiating playback
	// Could request animation frame?

	function convertToMS(seconds) {
		return parseInt(seconds * 1000);
	}

	function convertToSeconds(ms) {
		return ms / 1000;
	}

	const getCartTimestamp = useCallback( (track, activeTime) => {

		return track.start_timestamp + activeTime;

	}, []);

	const startLocalPlayback = useCallback( (track, startTime) => {

		console.log('aT in sLP: ', activeTrack);

		// Set local audio ref to track's audio value
		audioRef.current = track.audio;
		console.log('audioRef.current: ', audioRef.current);

		const fileLength = convertToMS(audioRef.current.duration);
		const playLength = track.length;
		console.log('fileLength: ', fileLength);
		console.log('playLength: ', playLength);

		fileLengthRef.current = fileLength;
		remainingPlayLengthRef.current = playLength;

		// Not the best way of doing this, but this is aimed at the tape hiss track
		if (playLength < fileLength) {
			console.log('tL < aL');
			console.log(fileLength);
			console.log(playLength);
			audioRef.current.currentTime = convertToSeconds(fileLength - playLength);
			remainingPlayLengthRef.current = 0;
		}
		else {
			console.log('tL !< aL');
			audioRef.current.currentTime = 0;
			remainingPlayLengthRef.current -= convertToMS(audioRef.current.duration);
		}

		console.log('currentTime: ', audioRef.current.currentTime);

		audioRef.current.play();

		// While the remaining playLength is greater than fileLength,
		// keep playing, pausing, rewinding, then deducting from remainingLength

		// When remainingLength is less than fileLength, play until set point, 
		// then pause and 'rewind'

	}, [activeTrack])

	const handlePlaybackEnd = useCallback(() => {

		console.log('Local audio ended');

		if (remainingPlayLengthRef.current >= fileLengthRef.current) {
			console.log('Entering hPE routine 1');
			console.log(fileLengthRef.current);
			console.log(remainingPlayLengthRef.current);
			audioRef.current.currentTime = 0;
			audioRef.current.play();
			remainingPlayLengthRef.current = remainingPlayLengthRef.current - convertToMS(audioRef.current.duration);
		}
		else if (remainingPlayLengthRef.current > 0) {
			console.log('Entering hPE routine 2');
			// This is a poor way of doing this because instead of ending
			// at a set point, we're beginning at a set point, but at the moment,
			// this function is only meant to be used with the tape hiss audio track,
			// which is mostly consistent throughout
			audioRef.current.currentTime = convertToSeconds(remainingPlayLengthRef.current);
			audioRef.current.play();
		}
		else {
			console.log('Entering hPE routine 3');
			// Pause and 'rewind' audio
			audioRef.current.pause();
			audioRef.current.currentTime = 0;

			// Calculate cartTimestamp
			console.log('aT in hPE3: ', activeTrack);
			const cartTimestamp = getCartTimestamp(activeTrack, audioRef.current.duration);

			// Emit a track end 'event'
			console.log('Emitting track change event');
			setTrackChangeEvent({
				activeTrack: activeTrack,
				cartTimestamp: cartTimestamp,
				type: TRACK_EVENT_TYPES.TRACK_END
			});
		}

	}, [activeTrack]);

	/*
	// Effect hook for listening for track end and updating remaining length
	useEffect(() => {
		if (isCartPlaying && activeTrack.type === EFFECT) {

			console.log('Creating audioRef listener');

			audioRef.current.addEventListener('ended', (event) => {
				console.log('Audio ended');
				handlePlaybackEnd();
			})
		}

		return () => {
			if (audioRef.current) {
				audioRef.current.removeEventListener('ended', (event) => {
					handlePlaybackEnd();
				})
			}
		}
	}, [isCartPlaying, activeTrack]);
	*/

	// Effect hook for initiating playback on change of activeTrack
	useEffect(() => {

		console.log('Initiating track initiation hook local player');

		// If no activeTrack or not playing, return
		if (!activeTrack || !isCartPlaying) {
			console.log('No aT, no isPlaying');
			return;
		}

		// Otherwise, if activeTrack is of type EFFECT...
		else if (activeTrack.type === EFFECT) {
			console.log('aT of type EFFECT');

			// Pull overall cart timestamp from last emitted 'event' (if it exists)
			const cartTimestamp = trackChangeEvent
				? trackChangeEvent.cartTimestamp + 1
				: 0;
			
			// Start playback
			console.log('cartTimestamp: ', cartTimestamp);
			console.log('Starting playback');
			console.log('activeTrack in localPlayer: ', activeTrack);
			startLocalPlayback(activeTrack, cartTimestamp);

			// Create listener for track end
			console.log('Creating audioRef listener');

			audioRef.current.addEventListener('ended', (event) => {
				console.log('Audio ended');
				handlePlaybackEnd();
			})

			return () => {
				audioRef.current.removeEventListener('ended', (event) => {
					handlePlaybackEnd();
				})
			}
		}


	}, [activeTrack, isCartPlaying, startLocalPlayback, trackChangeEvent]);

	// Effect hook for playing and pausing audio


	// Some sort of callback to execute on end?

	// What if we emitted an "event" on end that set some piece of state?


	
	return (
		<h1>Placeholder for LocalPlayer</h1>
	)
}