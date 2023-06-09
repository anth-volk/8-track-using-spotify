'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('Programs', {
			program_id: {
				primaryKey: true,
				type: Sequelize.UUID,
				allowNull: false
			},
			program_length_ms: {
				type: Sequelize.BIGINT
			},
			intra_track_fade_length_ms: {
				type: Sequelize.BIGINT
			},
			createdAt: {
				allowNull: false,
				type: Sequelize.DATE
			},
			updatedAt: {
				allowNull: false,
				type: Sequelize.DATE
			}
		}, {
			onDelete: 'cascade'
		});
	},
	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable('Programs');
	}
};