
async function getAlbum(req, res) {

	const albumId = req.query.album_id;
	const authToken = req.headers.authorization;

	if (!req.query || !req.query.album_id) {
		return res
			.status(400)
			.json({
				connection_status: 'failure',
				error_message: 'No "album ID" query parameter provided'
			});
	}
	else {

		const resultObjectRaw = await fetch('https://api.spotify.com/v1/albums/' + albumId, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': authToken
			}
		});
		const resultObjectJSON = await resultObjectRaw.json();

		return res
			.status(200)
			.json({
				connection_status: 'success',
				result_object: resultObjectJSON
			});
		}
}

async function searchAlbum(req, res) {

	const MAX_RESULTS = 6;
	const searchString = req.query.album;
	const authToken = req.headers.authorization;

	if (!req.query || ! req.query.album) {
		return res
			.status(400)
			.json({
				connection_status: 'failure',
				error_message: 'No "album" query parameter provided'
			});
	}
	else {

		const resultObjectRaw = await fetch('https://api.spotify.com/v1/search?q=' + searchString + '&type=album&limit=' + MAX_RESULTS, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': authToken
			}
		});
		const resultObjectJSON = await resultObjectRaw.json();

		return res
			.status(200)
			.json({
				connection_status: 'success',
				result_object: resultObjectJSON
			});
	}
}

module.exports = {
	getAlbum,
	searchAlbum
}