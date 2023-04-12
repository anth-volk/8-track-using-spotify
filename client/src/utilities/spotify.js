/**
 * Takes a given track array (formatted via parseAlbumAndPullTracks)
 * and returns an object of four programs
 * @param {Array.<Object>} trackArray 
 * @returns {Object}
 */
export function finalizeTracks(trackArray) {
	// Define result object of four programs with flexible number of tracks


	// Sort tracks into an array of objects based on length
	const sortedTrackArray = sortTracks(trackArray);

	// Calculate the "ideal" time for each program by iterating
	// over the trackArray and adding length to a sum var
	const idealTime = calculateIdealTime(sortedTrackArray);

	// Recursively take the longest and assign it either to the
	// first program lacking a track, or if each has one, the one
	// most deviated from ideal program time
	const roughResultArray = distributeTracksToPrograms(sortedTrackArray, idealTime);

	// TESTING
	return roughResultArray;

	// Reorder tracks in place based on track number

	// Calculate start and end times of each track; unclear what data struct
	// to use

	// Return the output

}

/**
 * Takes a sorted track array (formatted via parseAlbumAndPullTracks)
 * assigns them to four programs, and assigns the length of each program
 * @param {Array.<Object>} trackArray 
 * @param {Number} idealTime 
 */
export function distributeTracksToPrograms(sortedTrackArray, idealTime) {

	// Define result array
	let resultArray = [
		{
			program_number: 1,
			tracks: [],
			program_length: 0
		},
		{
			program_number: 2,
			tracks: [],
			program_length: 0
		},
		{
			program_number: 3,
			tracks: [],
			program_length: 0
		},
		{
			program_number: 4,
			tracks: [],
			program_length: 0
		},
	];

	// Define array that will contain each program's respective
	// "variance" from the ideal duration
	let varianceArray = [
		idealTime,
		idealTime,
		idealTime,
		idealTime
	];

	sortedTrackArray.forEach( (track, index) => {
		if (index < 4) {
			resultArray[index].tracks = resultArray[index].tracks.concat(track);
			varianceArray[index] = Math.abs(varianceArray[index] - track.duration_ms);
			resultArray[index].program_length += track.duration_ms;
			console.log(resultArray);
		}
		else {
			console.log('varianceArray:');
			console.log(varianceArray);
			const j = varianceArray.indexOf(Math.max(...varianceArray));
			resultArray[j].tracks = resultArray[j].tracks.concat(track);
			varianceArray[j] = Math.abs(varianceArray[j] - track.duration_ms);
			resultArray[j].program_length += track.duration_ms;
			console.log(resultArray);
		}
	})

	return resultArray;
	
}

/**
 * Takes a track array (formatted via parseAlbumAndPullTracks) 
 * and calculates the ideal time for one 8-track program, in ms
 * @param {Array.<Object>} trackArray 
 * @return {Number}
 * 
 */
export function calculateIdealTime(trackArray) {

	return trackArray
		.reduce( (total, track) => total + track.duration_ms, 0)
		/ 4;

}

/**
 * Takes a track array (formatted via parseAlbumAndPullTracks)
 * and sorts the tracks by length
 * @param {Array.<Object>} trackArray
 * @returns {Array.<Object>}
 */
export function sortTracks(trackArray) {

	return trackArray
		.sort( (a, b) => {
			return b.duration_ms - a.duration_ms
		});

}

/**
 * Takes given Spotify album object (from fetching albums, not searching),
 * parses it, and returns an object with the album's tracks, their lengths,
 * and their track numbers
 * @param {Object} spotifyAlbumObject 
 * @returns {Array.<Object>}
 */
export function parseAlbumAndPullTracks(spotifyAlbumObject) {

	let resultArray = [];

	spotifyAlbumObject.tracks.items.map( (track, index) => {
		resultArray = [
			...resultArray,
			{
				track_number: track.track_number,
				id: track.id,
				duration_ms: track.duration_ms
			}
		]
	});

	return resultArray;

}