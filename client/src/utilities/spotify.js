/**
 * Takes a given track array (formatted via parseAlbumAndPullTracks)
 * and returns an object of four programs
 * @param {Array.<Object>} trackArray 
 * @returns {Object}
 */
export function finalizeTracks(trackArray) {

	// Sort tracks into an array of objects based on length
	const sortedTrackArray = sortTracksByDuration(trackArray);

	// Calculate the "ideal" time for each program by iterating
	// over the trackArray and adding length to a sum var
	const idealTime = calculateIdealTime(sortedTrackArray);

	// In a loop, take the longest and assign it either to the
	// first program lacking a track, or if each has one, the one
	// most deviated from ideal program time
	const programArray = distributeTracksToPrograms(sortedTrackArray, idealTime);

	// Reorder tracks in place based on track number
	const programArraySorted = sortRoughResultArray(programArray);

	// Calculate intra-track fade times for each program
	const programArrayFadeTimes = addFadeTimes(programArraySorted);

	return programArrayFadeTimes;
}

function addFadeTimes(programArraySorted)  {

	// Iterate over programs and determine which is longest
	const programLengthArray = programArraySorted.reduce( (accuArr, program) => {
		return accuArr.concat(program.program_length);
	}, []);

	const longestProgram = Math.max(...programLengthArray);

	// For each program...
	return programArraySorted.map( (program) => {

		// Calculate difference between program length and longestProgram
		const programLengthDeficit = longestProgram - program.program_length;

		// Average this difference over (number of tracks minus 1), casting to int,
		// to determine between-track fade length
		let fadeLength = 0;

		if (program.tracks.length > 1) {
			fadeLength = Math.round(programLengthDeficit / (program.tracks.length - 1));
		}
		else {
			fadeLength = programLengthDeficit;
		};

		// Add fade length, as well as total length (equal to 
		// the length of the longest program) to the program object
		return ({
			...program,
			intra_track_fade: fadeLength,
			program_length_ms: longestProgram
		});

		/*
		// Accumulated time starts with fade-in length
		let accumulatedTime = FADE_IN_MS;

		// For each track...
		const tracksWithTimes = program.tracks.map( (track) => {

			// Calculate a start_time_ms and end_time_ms val
			// Start time is equal to any accumulated time on program, plus 1
			const startTimeMs = accumulatedTime + 1;

			// End time will be the start time, plus the track's duration
			const endTimeMs = startTimeMs + track.duration_ms;

			// Then, accumulated time will be updated to inclue this, 
			// plus the inter-track fade length
			accumulatedTime = endTimeMs + fadeLength;

			return ({
				...track,
				start_time_ms: startTimeMs,
				end_time_ms: endTimeMs
			});
		})

		return({
			...program,
			tracks: tracksWithTimes
		});
		*/
	})
}

export function sortRoughResultArray(roughResultArray) {

	return roughResultArray.map( (program) => {
		const newTracks = sortTracksByNumber(program.tracks);
		return {
			...program,
			tracks: newTracks
		}
	})

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
		}
		else {
			const j = varianceArray.indexOf(Math.max(...varianceArray));
			resultArray[j].tracks = resultArray[j].tracks.concat(track);
			varianceArray[j] = Math.abs(varianceArray[j] - track.duration_ms);
			resultArray[j].program_length += track.duration_ms;
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

	const NUMBER_OF_PROGRAMS = 4;

	return trackArray
		.reduce( (total, track) => total + track.duration_ms, 0)
		/ NUMBER_OF_PROGRAMS;

}

/**
 * Takes a track array (formatted via parseAlbumAndPullTracks)
 * and sorts the tracks by length
 * @param {Array.<Object>} trackArray
 * @returns {Array.<Object>}
 */
export function sortTracksByDuration(trackArray) {

	return trackArray
		.sort( (a, b) => {
			return b.duration_ms - a.duration_ms
		});

}

export function sortTracksByNumber(trackArray) {

	return trackArray
		.sort( (a, b) => {
			return a.track_number - b.track_number
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

	spotifyAlbumObject.tracks.items.map( (track) => {
		return resultArray = [
			...resultArray,
			{
				name: track.name,
				track_number: track.track_number,
				id: track.id,
				duration_ms: track.duration_ms
			}
		]
	});

	return resultArray;

}