'use strict';

const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
	class Cart extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
			this.hasOne(models.Program, {
				as: 'program1',
				sourceKey: 'program1_id',
				foreignKey: 'program_id'
			});
			this.hasOne(models.Program, {
				as: 'program2',
				sourceKey: 'program2_id',
				foreignKey: 'program_id'
			});
			this.hasOne(models.Program, {
				as: 'program3',
				sourceKey: 'program3_id',
				foreignKey: 'program_id'
			});
			this.hasOne(models.Program, {
				as: 'program4',
				sourceKey: 'program4_id',
				foreignKey: 'program_id'
			});

		}
	}
	Cart.init({
		cart_id: {
			primaryKey: true,
			type: DataTypes.UUID,
			allowNull: false,
		},
		user_id: {
			type: DataTypes.UUID,
			allowNull: false
		},
		cart_name: {
			type: DataTypes.STRING,
			allowNull: false
		},
		program1_id: {
			type: DataTypes.UUID,
			allowNull: false,
			references: {
				model: {
					tableName: 'Programs'
				},
				key: 'program_id'
			}
		},
		program2_id: {
			type: DataTypes.UUID,
			allowNull: false,
			references: {
				model: {
					tableName: 'Programs'
				},
				key: 'program_id'
			}
		},
		program3_id: {
			type: DataTypes.UUID,
			allowNull: false,
			references: {
				model: {
					tableName: 'Programs'
				},
				key: 'program_id'
			}
		},
		program4_id: {
			type: DataTypes.UUID,
			allowNull: false,
			references: {
				model: {
					tableName: 'Programs'
				},
				key: 'program_id'
			}
		},
		artists_array: DataTypes.ARRAY(DataTypes.STRING)
	}, {
		sequelize,
		modelName: 'Cart',
	});
	return Cart;
};