// External imports
import { Fragment, useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';

// Internal imports
import { finalizeAlbum, finalizeTracks, parseAlbumAndPullTracks } from '../utilities/spotify.js';

export default function CartCreation(props) {

	const [albumSearchParam, setAlbumSearchParam] = useState('');
	const [albumResultObject, setAlbumResultObject] = useState(null);
	const [clickedAlbum, setClickedAlbum] = useState(null);
	const [distributedAlbum, setDistributedAlbum] = useState(null);

	const [cookies, setCookie, removeCookie] = useCookies();

	function handleSearchValueUpdate(event) {
		setAlbumSearchParam(event.target.value);
	}

	async function handleSearchSubmission() {

		const responseObjectRaw = await fetch(process.env.REACT_APP_BACKEND_TLD + '/api/v1/spotify/search_album?album=' + albumSearchParam, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'CORS': 'Access-Control-Allow-Origin',
				'Authorization': 'Bearer ' + cookies.userSpotifyAuth.access_token
			}
		});

		const responseObjectJSON = await responseObjectRaw.json();

		setAlbumResultObject(responseObjectJSON.result_object.albums.items);

	}

	async function handleAlbumClick(index) {

		const responseObjectRaw = await fetch(process.env.REACT_APP_BACKEND_TLD + '/api/v1/spotify/get_album?album_id=' + albumResultObject[index].id, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'CORS': 'Access-Control-Allow-Origin',
				'Authorization': 'Bearer ' + cookies.userSpotifyAuth.access_token
			}
		});

		const responseObjectJSON = await responseObjectRaw.json();

		setClickedAlbum(responseObjectJSON.result_object);
	}

	async function handleCartCreation() {

		console.log('Accessing handleCartCreation');
		const responseObjectRaw = await fetch(process.env.REACT_APP_BACKEND_TLD + '/api/v1/protected/library/create_cart', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'CORS': 'Access-Control-Allow-Origin',
				'Authorization': 'JWT ' + cookies.userAuth
			},
			body: JSON.stringify(distributedAlbum)
		});

		console.log(responseObjectRaw);
		
		if (responseObjectRaw.ok) {

			const responseObjectJSON = await responseObjectRaw.json();
			console.log(responseObjectJSON);

		}

	}

	useEffect(() => {
		if (clickedAlbum) {
			const albumTracksArray = parseAlbumAndPullTracks(clickedAlbum);
			const albumTracksDistributed = finalizeTracks(albumTracksArray);

			const albumArtists = clickedAlbum.artists.map( (artist) => {
				return artist.name;
			});

			const finalizedAlbum = {
				name: clickedAlbum.name,
				artists: albumArtists,
				programs: albumTracksDistributed
			};
			console.log(finalizedAlbum);

			setDistributedAlbum(finalizedAlbum);
		}

	}, [clickedAlbum]);

	return(
		<Fragment>
			<h1>Create New Cartridge</h1>
			<grid>
				<div className='CartCreation_left'>
					<h2>Search for an album below:</h2>
					{/*Display little search icon*/}
					<input type='text' value={albumSearchParam} name='albumSearchParam' placeholder='Find an album' onChange={handleSearchValueUpdate}></input>
					<button type='button' onClick={handleSearchSubmission}>Search</button>
					<div className='CartSearch_grid'>
						{albumResultObject && Object.keys(albumResultObject).map((key, index) => {
							return (
								<div className='spotifyResultCard' key={index} onClick={(e) => {handleAlbumClick(index)}}>
									<img src={albumResultObject[index].images[0].url}></img>
									<p>{albumResultObject[index].artists[0].name} </p>
									<p>{albumResultObject[index].name}</p>
								</div>
							)
						})}
					</div>
				</div>
				<div className='CartCreation_right'>
					<h2>Cartridge Preview</h2>
					<div className='CartPreview_container'>
						{clickedAlbum && 
							<Fragment>
								<img className='CartPreview_image' src={clickedAlbum.images[0].url}></img>
								<p>{clickedAlbum.artists[0].name.toUpperCase()}</p>
								<p>{clickedAlbum.name}</p>
							</Fragment>
						}
					</div>
					{clickedAlbum && !distributedAlbum &&
						<p>Loading...</p>
					}
					{distributedAlbum &&
						<button type='button' onClick={handleCartCreation}>Create New Cartridge</button>
					}
				</div>
			</grid>
		</Fragment>
	)
}