// Function for calculating overall cart timestamp using track position
export async function getCartTimestampSpotify(activeTrack, spotifyPlayer, isTrackEnd = false) {

	let position = 0;

	// This is written this way because the method for measuring
	// track end using Spotify SDK requires the track to be at position=0,
	// thereby simulating the beginning of the track
	if (isTrackEnd) {
		return activeTrack.end_timestamp;
	}
	else {
		const state = await getSpotifyPlayerState(spotifyPlayer);
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

export async function startSpotifyPlayback(track, cartTimestamp, deviceId, spotifyUserAuthToken) {

	const uri = track.audio;
	const startTime = cartTimestamp - track.start_timestamp + 1;

	try {
		console.log('Trying Spotify fetch');

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
		console.log(responseRaw);

		if (!responseRaw.ok) {
			const responseJSON = await responseRaw.json();
			console.log(responseJSON);
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