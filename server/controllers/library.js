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

const Program = require('../models/Program')(sequelize);
const Cart = require('../models/Cart')(sequelize);
const Track = require('../models/Track')(sequelize);

async function postCartridge(req, res) {

	try {

		const userId = req.user.userId;
		const cartridge = req.body;

		let programIdArr = [];

		const result = await sequelize.transaction(async (t) => {

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
				cart_id: crypto.randomUUID(),
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

module.exports = {
	postCartridge
};