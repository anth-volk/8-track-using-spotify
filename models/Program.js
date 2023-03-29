'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Program extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
	  Program.hasMany(Track);
	  Program.belongsTo(Cart);
    }
  }
  Program.init({
    program_id: {
		primaryKey: true,
		type: DataTypes.UUID,
		allowNull: false
	},
    track1_id: {
		type: DataTypes.UUID,
		allowNull: false,
		references: {
			model: {
				tableName: 'Tracks'
			},
			key: 'track_id'
		}
	},
    track2_id: {
		type: DataTypes.UUID,
		references: {
			model: {
				tableName: 'Tracks'
			},
			key: 'track_id'
		}
	},
    track3_id: {
		type: DataTypes.UUID,
		references: {
			model: {
				tableName: 'Tracks'
			},
			key: 'track_id'
		}
	},
    track4_id: {
		type: DataTypes.UUID,
		references: {
			model: {
				tableName: 'Tracks'
			},
			key: 'track_id'
		}
	}
  }, {
    sequelize,
    modelName: 'Program',
  });
  return Program;
};