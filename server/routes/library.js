const express = require('express');
const router = express.Router();

router.route('/create_cart')
	// Route to create new cartridge within user's library
	.post(async (req, res) => {

		try {

			const result = await createCartridge(req);
			return res
				.status(201)
				.json({
					connection_status: 'success',
					created_cartridge: result
				});
		}
		catch (err) {
			console.error('Error while trying to store user-defined cartridge: ', err);
			return res
				.status(500)
				.json({
					connection_status: 'failure',
					error_message: err
				});
		}
	});

module.exports = router;