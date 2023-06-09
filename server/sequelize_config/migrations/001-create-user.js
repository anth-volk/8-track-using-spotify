'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('Users', {
			user_id: {
				allowNull: false,
				unique: true,
				primaryKey: true,
				type: Sequelize.UUID
			},
			email: {
				allowNull: false,
				unique: true,
				type: Sequelize.STRING
			},
			password_hash: {
				allowNull: false,
				type: Sequelize.STRING
			},
			first_name: {
				allowNull: false,
				type: Sequelize.STRING
			},
			last_name: {
				allowNull: false,
				type: Sequelize.STRING
			},
			refresh_token_hash: {
				type: Sequelize.STRING
			},
			createdAt: {
				allowNull: false,
				type: Sequelize.DATE
			},
			updatedAt: {
				allowNull: false,
				type: Sequelize.DATE
			}
		});
	},
	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable('Users');
	}
};