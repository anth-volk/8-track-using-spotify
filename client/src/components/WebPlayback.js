import React, { useEffect, useState } from 'react';

export default function WebPlayback(props) {

	const spotifyUserAuthToken = props.authToken || null;

	const track = {
		name: "",
		album: {
			images: [
				{ url: "" }
			]
		},
		artists: [
			{ name: "" }
		]
	}

	const [player, setPlayer] = useState(null);
	const [isPaused, setIsPaused] = useState(false);
	const [isPlaybackActive, setIsPlaybackActive] = useState(false);
	const [currentTrack, setCurrentTrack] = useState(track);
	const [deviceId, setDeviceId] = useState(null);

	// Spotify SDK hook
	useEffect(() => {

		const script = document.createElement("script");
		script.src = "https://sdk.scdn.co/spotify-player.js";
		script.async = true;
	
		document.body.appendChild(script);
	
		window.onSpotifyWebPlaybackSDKReady = () => {
	
			const player = new window.Spotify.Player({
				name: 'Web Playback SDK',
				getOAuthToken: cb => { cb(spotifyUserAuthToken); },
				volume: 0.5
			});

			setPlayer(player);

			player.addListener('ready', ({ device_id }) => {
				console.log('Ready with Device ID', device_id);
				setDeviceId(device_id);
			});
	
			player.addListener('not_ready', ({ device_id }) => {
				console.log('Device ID has gone offline', device_id);
			});
	
			player.addListener('player_state_changed', ( state => {

                if (!state) {
                    return;
                }

                setCurrentTrack(state.track_window.current_track);
                setIsPaused(state.paused);

                player.getCurrentState().then( state => { 
                    (!state)? setIsPlaybackActive(false) : setIsPlaybackActive(true) 
                });

            }));

			player.on('playback_error', ({message}) => {
				console.error('Failed to perform playback', message);
			})

			player.connect();
	
		};

	}, []);

	useEffect(() => {

		async function transferPlayback() {

			await fetch('https://api.spotify.com/v1/me/player', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': 'Bearer ' + spotifyUserAuthToken
				},
				body: JSON.stringify({
					device_ids: [
						deviceId
					],
					play: true
				})
			});

		}

		if (deviceId) {
			transferPlayback();
		}

	}, [deviceId])

	if (!isPlaybackActive) { 
        return (
            <>
                <div className="container">
                    <div className="main-wrapper">
                        <b> Instance not active. Transfer your playback using your Spotify app </b>
                    </div>
                </div>
            </>)
    } else {
        return (
            <>
                <div className="container">
                    <div className="main-wrapper">

                        <img src={currentTrack.album.images[0].url} className="now-playing__cover" alt="" />

                        <div className="now-playing__side">
                            <div className="now-playing__name">{currentTrack.name}</div>
                            <div className="now-playing__artist">{currentTrack.artists[0].name}</div>

                            <button className="btn-spotify" onClick={() => { player.previousTrack() }} >
                                &lt;&lt;
                            </button>

                            <button className="btn-spotify" onClick={() => { player.togglePlay() }} >
                                { isPaused ? "PLAY" : "PAUSE" }
                            </button>

                            <button className="btn-spotify" onClick={() => { player.nextTrack() }} >
                                &gt;&gt;
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    }
}