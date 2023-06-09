'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('Carts', {
			cart_id: {
				allowNull: false,
				primaryKey: true,
				type: Sequelize.UUID
			},
			user_id: {
				type: Sequelize.UUID,
				allowNull: false,
				references: {
					model: {
						tableName: 'Users'
					},
					key: 'user_id'
				}
			},
			cart_name: {
				type: Sequelize.STRING,
				allowNull: false
			},
			program1_id: {
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
			program2_id: {
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
			program3_id: {
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
			program4_id: {
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
			artists_array: {
				type: Sequelize.ARRAY(Sequelize.STRING)
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
		await queryInterface.dropTable('Carts');
	}
};