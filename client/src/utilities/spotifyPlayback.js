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