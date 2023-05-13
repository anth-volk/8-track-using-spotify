function convertToMS(seconds) {
	return parseInt(seconds * 1000);
}

function convertToSeconds(ms) {
	return ms / 1000;
}

export function getCartTimestampLocal(activeTrack, trackRef, remainingPlayLength) {
	if (remainingPlayLength === 0) {
		// This is done at the moment because, for its final playthrough,
		// a track's start time is measured as some number of seconds from the end
		// to avoid the more complicated task of playing part of an audio file
		console.log('aT.et: ', activeTrack.end_timestamp);
		console.log('rPL: ', remainingPlayLength);
		console.log('tR.d: ', trackRef.duration);
		console.log('tR.ct: ', trackRef.currentTime);
		return activeTrack.end_timestamp - (convertToMS(trackRef.duration) - convertToMS(trackRef.currentTime));
	}
	else {
		return activeTrack.end_timestamp - remainingPlayLength - convertToMS(trackRef.duration) + convertToMS(trackRef.currentTime);
	}
}	
// + (duration - currentTime)

export function handlePlayPauseLocal(trackRef, isCartPlaying) {
	if (!isCartPlaying) {
		trackRef.play();
	}
	else {
		trackRef.pause();
	}
}

export function handleTrackEndLocal(activeTrack, trackRef, fileLength, remainingPlayLength) {

	console.log('Local audio ended');
	let playbackState = true;

	if (remainingPlayLength >= fileLength) {
		console.log('Entering hPE routine 1');
		console.log(fileLength);
		console.log(remainingPlayLength);
		trackRef.currentTime = 0;
		trackRef.play();
		remainingPlayLength = remainingPlayLength - convertToMS(trackRef.duration);
	}
	else if (remainingPlayLength > 0) {
		console.log('Entering hPE routine 2');
		// This is a poor way of doing this because instead of ending
		// at a set point, we're beginning at a set point, but at the moment,
		// this function is only meant to be used with the tape hiss audio track,
		// which is mostly consistent throughout
		trackRef.currentTime = convertToSeconds(remainingPlayLength);
		trackRef.play();
	}
	else {
		console.log('Entering hPE routine 3');
		// Pause and 'rewind' audio
		trackRef.pause();
		trackRef.currentTime = 0;

		// Calculate cartTimestamp
		// console.log('aT in hPE3: ', trackRef);
		// const newCartTimestamp = getCartTimestamp(activeTrack, remainingPlayLength);
		playbackState = false;

		/*
		// Emit a track end 'event'
		console.log('Emitting track change event from local player');
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
		*/
	}

	const newCartTimestamp = getCartTimestampLocal(activeTrack, trackRef, remainingPlayLength);

	return ({
		fileLength: fileLength,
		remainingPlayLength: remainingPlayLength,
		cartTimestamp: newCartTimestamp,
		playbackState: playbackState
	});

}

export function startLocalPlayback(activeTrack, trackRef, cartTimestamp) {

	const startTime = cartTimestamp - activeTrack.start_timestamp;
	console.log('cT in local: ', cartTimestamp);
	console.log('aT.st in local: ', activeTrack.start_timestamp);
	console.log('startTime for local: ', startTime);
	// console.log('aT in sLP: ', activeTrack);

	/*
	// Set local audio ref to track's audio value
	audioRef.current = track.audio;
	console.log('audioRef.current: ', audioRef.current);
	*/

	console.log('trackRef: ', trackRef);

	let fileLength = convertToMS(trackRef.duration);
	let playLength = activeTrack.length - startTime;
	console.log('fileLength: ', fileLength);
	console.log('playLength: ', playLength);

	/*
	fileLengthRef.current = fileLength;
	remainingPlayLengthRef.current = playLength;
	*/

	// Not the best way of doing this, but this is aimed at the tape hiss track
	// When remainingLength is less than fileLength, start from point that number
	// of seconds from end, then play until end
	if (playLength < fileLength) {
		console.log('tL < aL');
		console.log(fileLength);
		console.log(playLength);
		trackRef.currentTime = convertToSeconds(fileLength - playLength);
		// remainingPlayLengthRef.current = 0;
		playLength = 0;
	}
	else {
		// While the remaining playLength is greater than fileLength,
		// keep playing, pausing, rewinding, then deducting from remainingLength
		console.log('tL !< aL');
		trackRef.currentTime = 0;
		playLength -= convertToMS(trackRef.duration);
	}

	console.log('currentTime: ', trackRef.currentTime);

	trackRef.play();
	return ({
		fileLength: fileLength,
		playLength: playLength,
		playbackState: true
	});

}
