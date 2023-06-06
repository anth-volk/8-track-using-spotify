// ORM import
const { Sequelize } = require('sequelize');

// ORM configuration
const sequelize = new Sequelize(
	process.env.DB_NAME_DEV,
	process.env.DB_USERNAME,
	process.env.DB_PASSWORD,
	{
		host: process.env.DB_HOST,
		dialect: 'postgres'
	}
);

const { Program, Cart, Track } = require('../models');

async function getLibrary(req, res) {

	try {

		const userId = req.user.userId;

		const result = await sequelize.transaction(async (t) => {

			const resultLibrary = await Cart.findAll({
				where: {
					user_id: userId
				},
				attributes: {
					exclude: [
						'user_id',
						'createdAt',
						'updatedAt',
						'program1_id',
						'program2_id',
						'program3_id',
						'program4_id'
					]
				},
				order: [
					'createdAt'
				],
				include: [
					{
						model: Program,
						as: 'program1',
						attributes: {
							exclude: [
								'program_id',
								'createdAt',
								'updatedAt'
							]
						},
						include: [
							{
								model: Track,
								as: 'tracks',
								attributes: {
									exclude: [
										'track_id',
										'program_id',
										'createdAt',
										'updatedAt'
									]
								}
							}
						],
					},
					{
						model: Program,
						as: 'program2',
						attributes: {
							exclude: [
								'program_id',
								'createdAt',
								'updatedAt'
							]
						},
						include: [
							{
								model: Track,
								as: 'tracks',
								attributes: {
									exclude: [
										'track_id',
										'program_id',
										'createdAt',
										'updatedAt'
									]
								}
							}
						],
					},
					{
						model: Program,
						as: 'program3',
						attributes: {
							exclude: [
								'program_id',
								'createdAt',
								'updatedAt'
							]
						},
						include: [
							{
								model: Track,
								as: 'tracks',
								attributes: {
									exclude: [
										'track_id',
										'program_id',
										'createdAt',
										'updatedAt'
									]
								}
							}
						],
					},
					{
						model: Program,
						as: 'program4',
						attributes: {
							exclude: [
								'program_id',
								'createdAt',
								'updatedAt'
							]
						},
						include: [
							{
								model: Track,
								as: 'tracks',
								attributes: {
									exclude: [
										'track_id',
										'program_id',
										'createdAt',
										'updatedAt'
									]
								}
							}
						],
					}
				]
			});

			return resultLibrary;

		})

		return res
			.status(200)
			.json({
				connection_status: 'success',
				library: result
			});

	}
	catch (err) {
		console.error('Error while fetching user cart library: ', err);
		return res
			.status(500)
			.json({
				connection_status: 'failure',
				error_message: err
			});
	}
}

async function postCartridge(req, res) {

	try {

		const userId = req.user.userId;
		const cartridge = req.body;

		let programIdArr = [];

		const result = await sequelize.transaction(async (t) => {

			const cartId = crypto.randomUUID();

			for (const [index, program] of cartridge.programs.entries()) {

				const programId = crypto.randomUUID();
				programIdArr = programIdArr.concat(programId);

				const resultProgram = await Program.create({
					program_id: programId,
					program_length_ms: program.program_length_ms,
					intra_track_fade_length_ms: program.intra_track_fade
				}, { transaction: t });

				for (const [index, track] of program.tracks.entries()) {

					const resultTrack = await Track.create({
						track_id: crypto.randomUUID(),
						spotify_track_id: track.id,
						program_id: programId,
						program_position: index,
						track_name: track.name,
						duration_ms: track.duration_ms
					}, { transaction: t });

				};
			};

			const resultCart = await Cart.create({
				cart_id: cartId,
				user_id: userId,
				cart_name: cartridge.name,
				artists_array: cartridge.artists,
				program1_id: programIdArr[0],
				program2_id: programIdArr[1],
				program3_id: programIdArr[2],
				program4_id: programIdArr[3]
			}, { transaction: t });

			return resultCart;
		})

		return res
			.status(201)
			.json({
				connection_status: 'success',
				created_cartridge: result
			});
	}
	catch (err) {
		console.error('Error while inputting new cartridge into database: ', err);
		return res
			.status(500)
			.json({
				connection_status: 'failure',
				error_message: err
			});
	}
}

async function deleteCartridge(req, res) {

	try {

		if (!req.query || !req.query.cart_id) {
			return res
				.status(400)
				.json({
					connection_status: 'failure',
					message: 'Missing required cartId query parameter'
				});
		}

		// Pull cart ID from query params and user ID
		// from data that is added by JWT verification middleware
		const { cart_id } = req.query;
		const { userId } = req.user;

		// Query db for a cart with the set cart ID attached to the user
		const resultCart = await sequelize.transaction(async (t) => {

			const cart = await Cart.findOne({
				where: {
					cart_id: cart_id,
					user_id: userId
				}
			}, { transaction: t });

			return cart;

		});

		// If it exists, execute delete operation and resolve 200
		if (resultCart) {

			// Pull program numbers from result
			const data = resultCart.dataValues;

			const programIds = [
				data.program1_id,
				data.program2_id,
				data.program3_id,
				data.program4_id
			]

			const result = await sequelize.transaction(async (t) => {

				// Delete cart
				await Cart.destroy({
					where: {
						cart_id: cart_id,
						user_id: userId
					}
				}, { transaction: t });

				// Delete programs, which should cascade into tracks
				for (const programId of programIds) {
					await Program.destroy({
						where: {
							program_id: programId
						}
					}, { transaction: t });
				}

			});

			return res
				.status(200)
				.json({
					connection_status: 'success',
					message: 'Cart destroyed'
				});
		}
		// Otherwise, resolve 404
		else {
			return res
				.status(404)
				.json({
					connection_status: 'success',
					message: 'No cart found with provided ID'
				});
		}

	}
	catch (err) {
		console.error('Error while trying to delete cartridge: ', err);
		return res
			.status(500)
			.json({
				connection_status: 'failure',
				error: err
			});
	}

}

module.exports = {
	deleteCartridge,
	getLibrary,
	postCartridge
};