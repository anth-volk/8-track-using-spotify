// Function for calculating overall cart timestamp using track position
export async function getCartTimestampSpotify(activeTrack, spotifyPlayer, isTrackEnd=false) {

	let position = 0;

	// This is written this way because the method for measuring
	// track end using Spotify SDK requires the track to be at position=0,
	// thereby simulating the beginning of the track
	if (isTrackEnd) {
		return activeTrack.end_timestamp;
	}
	/*
	else {
		console.log('track inside gCT: ', activeTrack);
		getSpotifyPlayerState(spotifyPlayer)
			.then( (state) => {
				console.log('track inside gSPS: ', activeTrack);
				position = state.position;
				console.log('position inside gSPS: ', position);
				return activeTrack.start_timestamp + position;
				// return track.start_timestamp + state.position;
			})
	*/
		/*
		console.log('position: ', position);
		console.log('position: ', position);

		console.log('Spotify timestamp return: ', activeTrack.start_timestamp + position);
		return activeTrack.start_timestamp + position;
		*/
	/*
	}
	*/
	else {
		const state = await getSpotifyPlayerState(spotifyPlayer);
		console.log('awaited state: ', state);
		const position = state.position;
		return activeTrack.start_timestamp + position;
	}
}

// Function for fetching Spotify player state via SDk
async function getSpotifyPlayerState(spotifyPlayer) {
	try {
		const state = await spotifyPlayer.getCurrentState();
		if (!state) {
			console.error('Error while obtaining Spotify player state: music not currently playing through SDK');
			return;
		}
		else {
			console.log('State from fetch function: ', state);
			return state;
		}
	}
	catch (err) {
		console.error('Error while obtaining Spotify player state: ', err);
	}
}

export function handlePlayPauseSpotify(spotifyPlayer, isCartPlaying) {
	if (!isCartPlaying) {
		spotifyPlayer.resume();
	}
	else {
		spotifyPlayer.pause();
	}
}

/*
// Track end handler with useCallback and async/await
export function handleTrackEndSpotify(activeTrack, spotifyPlayer) {

	// Calculate cartTimestamp
	console.log('track param inside handleTrackEnd: ', activeTrack);
	const newCartTimestamp = getCartTimestamp(activeTrack, spotifyPlayer, true);

	console.log('nCT: ', newCartTimestamp);

	/*
	// Emit a track end 'event'
	console.log('Emitting track change event from Spotify player');
	setTrackChangeEventQueue( (prev) => {
		return ([
			...prev,
			{
				activeTrack: track,
				cartTimestamp: newCartTimestamp,
				type: TRACK_EVENT_TYPES.TRACK_END
			}
		])
	});
	*/
/*
}
*/

export async function startSpotifyPlayback(track, cartTimestamp, deviceId, spotifyUserAuthToken) {

	const uri = track.audio;
	const startTime = cartTimestamp - track.start_timestamp + 1;

	try {
		const responseRaw = await fetch('https://api.spotify.com/v1/me/player/play?device_id=' + deviceId, {
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

			if (responseJSON.error.status === 502) {
				console.log('Re-requesting Spotify track');
				await startSpotifyPlayback(track, cartTimestamp, deviceId, spotifyUserAuthToken);
			}

			return false;
		}
		else {
			return true;
		}
	}
	catch (err) {
		console.error('Error while initiating Spotify playback: ', err);
		return false;
	}
}