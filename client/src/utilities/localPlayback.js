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
		return activeTrack.end_timestamp - (convertToMS(trackRef.duration) - convertToMS(trackRef.currentTime));
	}
	else {
		return activeTrack.end_timestamp - remainingPlayLength - convertToMS(trackRef.duration) + convertToMS(trackRef.currentTime);
	}
}	

export function handlePlayPauseLocal(trackRef, isCartPlaying) {
	if (!isCartPlaying) {
		trackRef.play();
	}
	else {
		trackRef.pause();
	}
}

export function handleTrackEndLocal(activeTrack, trackRef, fileLength, remainingPlayLength) {

	let playbackState = true;

	if (remainingPlayLength >= fileLength) {
		trackRef.currentTime = 0;
		trackRef.play();
		remainingPlayLength = remainingPlayLength - convertToMS(trackRef.duration);
	}
	else if (remainingPlayLength > 0) {
		// This is a poor way of doing this because instead of ending
		// at a set point, we're beginning at a set point, but at the moment,
		// this function is only meant to be used with the tape hiss audio track,
		// which is mostly consistent throughout
		trackRef.currentTime = convertToSeconds(remainingPlayLength);
		trackRef.play();
	}
	else {
		// Pause and 'rewind' audio
		trackRef.pause();
		trackRef.currentTime = 0;

		// Calculate cartTimestamp
		playbackState = false;
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

	let fileLength = convertToMS(trackRef.duration);
	let playLength = activeTrack.length - startTime;

	// Not the best way of doing this, but this is aimed at the tape hiss track
	// When remainingLength is less than fileLength, start from point that number
	// of seconds from end, then play until end
	if (playLength < fileLength) {
		trackRef.currentTime = convertToSeconds(fileLength - playLength);
		playLength = 0;
	}
	else {
		// While the remaining playLength is greater than fileLength,
		// keep playing, pausing, rewinding, then deducting from remainingLength
		trackRef.currentTime = 0;
		playLength -= convertToMS(trackRef.duration);
	}

	trackRef.play();
	return ({
		fileLength: fileLength,
		playLength: playLength,
		playbackState: true
	});

}
