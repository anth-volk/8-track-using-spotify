// import React, { Fragment, useEffect, useRef, useState } from 'react';
// 
// export default function WebPlayback(props) {
// 
// 	/*
// 	const activeCart = props.activeCart || null;
// 	const spotifyUserAuthToken = props.authToken || null;
// 	const activePlayback = props.activePlayback || null;
// 	const activeTime = props.activeTime || null;
// 
// 	console.log(activeCart);
// 	console.log('activePlayback: ', activePlayback);
// 	*/
// 
// 	// const [player, setPlayer] = useState(null);
// 	const [isPaused, setIsPaused] = useState(false);
// 	const [isPlaybackActive, setIsPlaybackActive] = useState(false);
// 	const [currentTrack, setCurrentTrack] = useState(track);
// 	// const [deviceId, setDeviceId] = useState(null);
// 
// 	const player = useRef(null);
// 	const deviceId = useRef(null);
// 
// 	const playerJSX = activeCart && isPlaybackActive
// 		? <p className='activeCart_details'>{activeCart.cart_name}</p>
// 		: activeCart
// 			? <p className='activeCart_message'>Loading player, please wait...</p>
// 			: null;
// 
// 	// Spotify SDK hook
// 	useEffect(() => {
// 
// 		const script = document.createElement("script");
// 		script.src = "https://sdk.scdn.co/spotify-player.js";
// 		script.async = true;
// 	
// 		document.body.appendChild(script);
// 	
// 		window.onSpotifyWebPlaybackSDKReady = () => {
// 	
// 			const playerConstructor = new window.Spotify.Player({
// 				name: 'Web Playback SDK',
// 				getOAuthToken: cb => { cb(spotifyUserAuthToken); },
// 				volume: 0.5
// 			});
// 
// 			player.current = playerConstructor;
// 			// setPlayer(player);
// 
// 			player.current.addListener('ready', ({ device_id }) => {
// 				console.log('Ready with Device ID', device_id);
// 				deviceId.current = device_id;
// 				// setDeviceId(device_id);
// 			});
// 	
// 			player.current.addListener('not_ready', ({ device_id }) => {
// 				console.log('Device ID has gone offline', device_id);
// 			});
// 	
// 			player.current.addListener('player_state_changed', ( state => {
// 
//                 if (!state) {
//                     return;
//                 }
// 
//                 setCurrentTrack(state.track_window.current_track);
//                 setIsPaused(state.paused);
// 
//                 player.current.getCurrentState().then( state => { 
//                     (!state)? setIsPlaybackActive(false) : setIsPlaybackActive(true) 
//                 });
// 
//             }));
// 
// 			player.current.on('playback_error', ({message}) => {
// 				console.error('Failed to perform playback', message);
// 			})
// 
// 			player.current.connect();
// 	
// 		};
// 
// 	}, []);
// 
// 	useEffect(() => {
// 
// 		async function transferPlayback() {
// 
// 			await fetch('https://api.spotify.com/v1/me/player', {
// 				method: 'PUT',
// 				headers: {
// 					'Content-Type': 'application/json',
// 					'Authorization': 'Bearer ' + spotifyUserAuthToken
// 				},
// 				body: JSON.stringify({
// 					device_ids: [
// 						deviceId.current
// 					],
// 					play: true
// 				})
// 			});
// 
// 		}
// 
// 		if (deviceId.current && activeCart) {
// 			transferPlayback();
// 		}
// 
// 	}, [deviceId, activeCart])
// 
// 	return (
// 		<Fragment>
// 			<div className='container'>
// 				<div className='main-wrapper'>
// 					{/*Empty 8-track player visual*/}
// 					{/*Inside of that: activeCart details, if present*/}
// 					{playerJSX}
// 				</div>
// 			</div>
// 		</Fragment>
// 	)
// }