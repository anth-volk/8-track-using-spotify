'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('Tracks', {
			track_id: {
				primaryKey: true,
				allowNull: false,
				type: Sequelize.UUID
			},
			spotify_track_id: {
				type: Sequelize.STRING,
				allowNull: false
			},
			program_id: {
				type: Sequelize.UUID,
				allowNull: false,
				references: {
					model: {
						tableName: 'Programs'
					},
					key: 'program_id'
				},
				onDelete: 'cascade'
			},
			program_position: {
				type: Sequelize.BIGINT
			},
			track_name: {
				type: Sequelize.STRING
			},
			duration_ms: {
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
		await queryInterface.dropTable('Tracks');
	}
};