const express = require('express');
const router = express.Router();

router.route('/search_album')
	.get(async (req, res) => {

		if (!req.query || ! req.query.album) {
			return res
				.status(400)
				.json({
					connection_status: 'failure',
					error_message: 'No "album" query parameter provided'
				});
		}
		else {

			const resultObjectRaw = await searchSpotifyForAlbum(req.query.album, req.headers.authorization);
			const resultObjectJSON = await resultObjectRaw.json();

			return res
				.status(200)
				.json({
					connection_status: 'success',
					result_object: resultObjectJSON
				});
		}
	});

router.route('/get_album')
	// GET request takes input data, executes Spotify request, then resolves to output
	.get(async (req, res) => {

		if (!req.query || !req.query.album_id) {
			return res
				.status(400)
				.json({
					connection_status: 'failure',
					error_message: 'No "album ID" query parameter provided'
				});
		}
		else {
			const resultObjectRaw = await getAlbumFromSpotify(req.query.album_id, req.headers.authorization);
			const resultObjectJSON = await resultObjectRaw.json();

			return res
				.status(200)
				.json({
					connection_status: 'success',
					result_object: resultObjectJSON
				});
		}

	});

module.exports = router;